import { useRef, useState, useEffect } from 'react';
import { useFrameProcessor } from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { Worklets } from 'react-native-worklets-core';
import * as Speech from 'expo-speech';
import * as Location from 'expo-location';

export type Detection = {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
};

const MODEL_INPUT_SIZE = 320;

interface PotholeConfig {
  onPotholeConfirmed?: (location: Location.LocationObjectCoords | null) => void;
}

export function usePotholeDetection({ onPotholeConfirmed }: PotholeConfig = {}) {
  const { resize } = useResizePlugin();

  const [detections, setDetections] = useState<Detection[]>([]);

  const lastUpdate = useRef(0);
  const lastSpeechTime = useRef(0);
  const frameCounter = useRef(0);

  const currentLocation = useRef<Location.LocationObjectCoords | null>(null);

  const { model, state } = useTensorflowModel(
    require('../../assets/model/pothole.tflite'),
  );

  // 📍 GPS Tracking (optimized)
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // ✅ optimized
          distanceInterval: 5,
        },
        (loc) => {
          currentLocation.current = loc.coords;
        }
      );
    };

    startTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  // 🚀 Efficient Top-K selector (no sort)
  const getTopDetections = (arr: Detection[], limit = 5) => {
    const result: Detection[] = [];

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      let inserted = false;

      for (let j = 0; j < result.length; j++) {
        if (item.score > result[j].score) {
          result.splice(j, 0, item);
          inserted = true;
          break;
        }
      }

      if (!inserted && result.length < limit) {
        result.push(item);
      }

      if (result.length > limit) {
        result.pop();
      }
    }

    return result;
  };

  // ✅ UI updater (optimized + throttled)
  const updateDetections = Worklets.createRunOnJS((newDetections: Detection[]) => {
    const now = Date.now();

    if (now - lastUpdate.current < 200) return;
    lastUpdate.current = now;

    if (newDetections.length === 0) return; // ✅ skip empty

    const topDetections = getTopDetections(newDetections);

    setDetections(topDetections);

    if (topDetections.length > 0) {
      if (now - lastSpeechTime.current > 3000) {
        Speech.stop(); // ✅ prevent stacking
        Speech.speak('Pothole detected');

        lastSpeechTime.current = now;

        if (onPotholeConfirmed) {
          onPotholeConfirmed(currentLocation.current);
        }
      }
    }
  });

  // ✅ YOLO Parser (optimized)
  const parseYOLO = (output: any): Detection[] => {
    'worklet';

    const results = new Array();

    if (!output || !output[0]) return results;

    const flatArray = output[0];
    const totalElements = flatArray.length;

    const numAttributes = 5;
    const numPredictions = totalElements / numAttributes;

    // ✅ compute once
    const isNormalized = flatArray[2] <= 2.0;
    const scale = isNormalized ? 1 : MODEL_INPUT_SIZE;

    for (let i = 0; i < numPredictions; i++) {
      const confidence = flatArray[4 * numPredictions + i];

      if (confidence <= 0.6) continue; // ✅ higher threshold

      const cx = flatArray[i];
      const cy = flatArray[numPredictions + i];
      const w = flatArray[2 * numPredictions + i];
      const h = flatArray[3 * numPredictions + i];

      results.push({
        x: (cx - w / 2) / scale,
        y: (cy - h / 2) / scale,
        w: w / scale,
        h: h / scale,
        score: confidence,
      });
    }

    return results;
  };

  // 🎥 Frame Processor (optimized)
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (!model) return;

    // ✅ frame skipping (reduce load)
    frameCounter.current++;
    if (frameCounter.current % 2 !== 0) return;

    const resized = resize(frame, {
      scale: {
        width: MODEL_INPUT_SIZE,
        height: MODEL_INPUT_SIZE,
      },
      pixelFormat: 'rgb',
      dataType: 'float32', // try 'uint8' if model supports
    });

    if (!resized) return;

    const output = model.runSync([resized]);

    const parsed = parseYOLO(output);

    if (parsed.length === 0) return; // ✅ avoid bridge call

    updateDetections(parsed);
  }, [model]);

  return {
    detections,
    modelState: state,
    frameProcessor,
  };
}