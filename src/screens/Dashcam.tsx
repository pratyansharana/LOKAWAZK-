import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';

import { Worklets } from 'react-native-worklets-core';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useResizePlugin } from 'vision-camera-resize-plugin';

import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

// The input size you used during Google Colab training (default is usually 320 or 640)
const MODEL_INPUT_SIZE = 320; 

type Detection = {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
};

export default function Dashcam() {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const { resize } = useResizePlugin();

  const [detections, setDetections] = useState<Detection[]>([]);
  const lastUpdate = useRef(0);

  const { model, state } = useTensorflowModel(
    require('../../assets/model/pothole.tflite'),
  );

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

// ✅ 1. Wrap the function using the NEW Worklets API
  const updateDetections = Worklets.createRunOnJS((newDetections: Detection[]) => {
    const now = Date.now();
    if (now - lastUpdate.current < 200) return;

    lastUpdate.current = now;
    setDetections(newDetections);

    if (newDetections.length > 0) {
      Speech.speak('Pothole detected');
    }
  });

  // ✅ 2. Custom YOLOv8 Parser
  const parseYOLO = (output: any): Detection[] => {
    'worklet';

    // 🚨 Trick Reanimated Babel by using 'new Array()' instead of '[]'
    const results = new Array(); 
    
    // YOLO outputs a single tensor, usually output[0]
    if (!output || !output[0]) return results;

    const flatArray = output[0]; 
    const totalElements = flatArray.length;
    
    // YOLOv8 format: 4 bounding box coords + 1 class confidence = 5 attributes per prediction
    const numAttributes = 5; 
    const numPredictions = totalElements / numAttributes; 

    // YOLO memory layout is [batch, attributes, predictions]
    for (let i = 0; i < numPredictions; i++) {
      const confidence = flatArray[4 * numPredictions + i];

      // Only process if confidence is greater than 50%
      if (confidence > 0.50) {
        const cx = flatArray[0 * numPredictions + i]; // Center X
        const cy = flatArray[1 * numPredictions + i]; // Center Y
        const w = flatArray[2 * numPredictions + i];  // Width
        const h = flatArray[3 * numPredictions + i];  // Height

        // Normalize coordinates to 0.0 - 1.0 percentages for UI drawing
        results.push({
          x: (cx - w / 2) / MODEL_INPUT_SIZE, 
          y: (cy - h / 2) / MODEL_INPUT_SIZE,
          w: w / MODEL_INPUT_SIZE,
          h: h / MODEL_INPUT_SIZE,
          score: confidence,
        });
      }
    }

    return results;
  };

// ✅ 3. Frame Processor
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (!model) return;

    const resized = resize(frame, {
      scale: {
        width: MODEL_INPUT_SIZE,
        height: MODEL_INPUT_SIZE,
      },
      pixelFormat: 'rgb',
      dataType: 'float32', 
    });

    if (!resized) return;

    const output = model.runSync([resized]);
    
    // Make sure you kept `const results = new Array();` inside here!
    const parsed = parseYOLO(output);

    // 🚨 Just call it directly! No runOnJS!
    updateDetections(parsed);
  }, [model]);

  if (!device || !hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={{color: 'white'}}>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 🎥 Camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5} // Keep at 5 FPS while debugging
      />

      {/* 🎯 Bounding Boxes */}
      {detections.map((det, index) => (
        <View
          key={index}
          style={[
            styles.box,
            {
              left: det.x * width,
              top: det.y * height,
              width: det.w * width,
              height: det.h * height,
            },
          ]}
        >
          <Text style={styles.label}>
            {Math.round(det.score * 100)}%
          </Text>
        </View>
      ))}

      {/* 📊 Debug Menu */}
      <View style={styles.topBar}>
        <Text style={styles.text}>Model: {state}</Text>
        <Text style={styles.text}>
          Detections: {detections.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  box: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#00FF00', 
    borderRadius: 4,
  },
  label: {
    color: 'black',
    backgroundColor: '#00FF00',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: 'bold',
  },
});