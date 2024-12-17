import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Fingerpose from 'fingerpose';
import { outstretchedhand, fist, pickGesture, DownwardGesture } from './gestures';

import { setHandSignal} from '../p5_sketch/observer_signal';
let previousAngle = null;
let cumulativeAngle = 0;
let videoCtx;
let handCtx;
let model;
let offscreenCanvas, offscreenCtx;
let previousLandmarks = null;
const thresholdNoise = 0.1;

const rotationThreshold = 90; 
const directionBuffer = []; 

export default class HandDetect {
    constructor() {
      this.predictions = [];
      this.websocket = null;
      this.fingerpose = Fingerpose;
      this.GE = new Fingerpose.GestureEstimator([fist, pickGesture,outstretchedhand, DownwardGesture])
      this.prev_x = null;
      this.prev_y = null;
      this.x = null;
      this.y = null;
      this.landmarks = [];
      var date = new Date();
      this.angle = 0;
      this.start = date.getTime();
      this.op_start = date.getTime();
      this.recorded_op_val = null;
      this.recorded_val = 0;
      this.pushCount = 0;
      this.threshold = 0.5;
      this.isrotating = false;
      this.cumulativeRotation = 0;
      this.rotationThreshold = Math.PI * 2; 
      this.isRotatingSignificantly = false; 
    }

    async requestPermissions() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
      } catch (error) {
        console.error('Error granting permissions:', error);
      }
    }
    
    async setupHandpose() {
      // load model 
     /*   await tf.ready();
        await tf.setBackend('webgl'); 
        const model = await handpose.load();
        await this.requestPermissions();
        const devices = await navigator.mediaDevices.enumerateDevices();
      //  console.log(devices);
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const externalCamera = videoDevices.find(device => device.label.toLowerCase().includes('kinect'));
        const deviceId = externalCamera ? externalCamera.deviceId : videoDevices[0].deviceId;
               // setup video 
        const video = document.createElement('video');
        video.width = 1500;  
        video.height = 800;
        video.style.display = 'none';
        const constraints = {
          video: {
            width: { ideal: 2000 },
            height: { ideal: 1000 },
          },
        };
        document.body.appendChild(video);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
      //  video.style.transform = 'scaleX(-1)'; // Flip horizontally
     //   video.style.width = '100%';
        // comment out video.play to disable camera and hand detection
       // video.play();
        video.addEventListener('loadeddata', async () => {
          this.detectHands(video, model);
        });*/
      }


      async detectHands(video, model) {
        let prev_predictions = await model.estimateHands(video);
        if(this.predictions.length === 0 && this.recorded_op_val !== null) {
          this.pushCount++;
          if(this.pushCount > 30) {
            setHandSignal(6);
            this.pushCount = 0;
            this.cumulativeRotation = 0;
          }
        }

        
        // if hand is detected
        //console.log(prev_predictions);
        if(prev_predictions.length > 0 && prev_predictions[0].boundingBox.bottomRight[0] - prev_predictions[0].boundingBox.topLeft[0] > 200) {
          this.predictions = prev_predictions;
        }
        else {
          this.predictions = [];
        }
        if (this.predictions.length > 0) {
            //console.log(this.predictions[0].boundingBox.bottomRight[1] - this.predictions[0].boundingBox.topLeft[1], this.predictions[0].boundingBox.bottomRight[0] - this.predictions[0].boundingBox.topLeft[0])
            const landmarks = this.predictions[0].landmarks;
          
         //   console.log( this.predictions[0].boundingBox.bottomRight[0] - this.predictions[0].boundingBox.topLeft[0]);
           // console.log( this.predictions[0].boundingBox.bottomRight[1] - this.predictions[0].boundingBox.topLeft[1]);

          /* const smoothedLandmarks = this.applyKalmanFilter(landmarks);
            this.landmarks = smoothedLandmarks;*/
            const filteredLandmarks = this.thresholdFilter(landmarks, previousLandmarks, this.predictions);
            previousLandmarks = filteredLandmarks;
            this.landmarks = filteredLandmarks;
            // landmarks for index finger
            this.x = this.landmarks[8][0];
            this.y = this.landmarks[8][1];
            this.detectRotation();
            const estimatedGestures = this.GE.estimate(this.predictions[0].landmarks, 8.7);
            const date = new Date();
            // based on the time passed, record positions for moving 
            if(date.getTime() - this.op_start > 500) {
              this.prev_x = this.x;
              this.prev_y= this.y;
              if(estimatedGestures.gestures.length != 0) {
                this.pushCount = 0;
                  this.op_start = date.getTime();
                  if(this.recorded_op_val === null || this.recorded_op_val.name !== estimatedGestures.gestures[0].name) {
                    this.recorded_op_val = estimatedGestures.gestures[0];
                  }
                  else if(this.recorded_op_val.name === estimatedGestures.gestures[0].name) {
                    this.detectOp(estimatedGestures.gestures[0].name)
                  }
                }

          }
        }
        requestAnimationFrame(() => this.detectHands(video, model));
    }  


    // unused rotation method
    detectRotation() {
      const hand = this.predictions[0];
      const wrist = hand.landmarks[0]; // Wrist landmark
      const indexFinger = hand.landmarks[5]; // Base of the index finger

      // Check if the wrist and index finger are within the bounding box
    //  if (this.isWithinBoundingBox(wrist) && this.isWithinBoundingBox(indexFinger)) {
        const currentAngle = this.calculateAngle(wrist, indexFinger);
        if (previousAngle !== null) {
          let deltaAngle = currentAngle - previousAngle;
          if (deltaAngle > 180) deltaAngle -= 360;
          if (deltaAngle < -180) deltaAngle += 360;

          // Accumulate the delta angle
          cumulativeAngle += deltaAngle;

          // Determine rotation direction (+1 for clockwise, -1 for counter-clockwise)
          const direction = deltaAngle > 0 ? 1 : -1;
          directionBuffer.push(direction);

          // Limit the buffer size
          if (directionBuffer.length > 10) {
            directionBuffer.shift();
          }
          // Check for consistent rotation
          const isConsistentRotation = directionBuffer.every((dir) => dir === direction);

          if (Math.abs(cumulativeAngle) >= rotationThreshold && isConsistentRotation) {
            console.log(`Circular rotation detected: ${cumulativeAngle.toFixed(2)}° (${direction > 0 ? 'Clockwise' : 'Counter-clockwise'})`);
            // Reset for detecting the next rotation
            cumulativeAngle = 0;
            directionBuffer.length = 0;
          }
        }
        previousAngle = currentAngle;
    }
    thresholdFilter(currentLandmarks, previousLandmarks) {
      if (!previousLandmarks) {
          return currentLandmarks;
      }
          //  console.log( this.predictions[0].boundingBox.bottomRight[0] - this.predictions[0].boundingBox.topLeft[0]);
          //console.log( this.predictions[0].boundingBox.bottomRight[1] - this.predictions[0].boundingBox.topLeft[1]);
      const filtered = currentLandmarks.map((point, index) => {
          const [x, y, z] = point;
          const [prevX, prevY, prevZ] = previousLandmarks[index];
          // Only update if the movement exceeds the threshold
          return [
              Math.abs(x - prevX) > thresholdNoise ? x : prevX,
              Math.abs(y - prevY) > thresholdNoise ? y : prevY,
              Math.abs(z - prevZ) > thresholdNoise ? z : prevZ
          ];
      });
  
      return filtered;
  }

    processFrame = async (frameData) => {
      if (!model) return;
            // Create ImageData for the original Kinect frame
      const originalWidth = 1920; // Kinect frame width
      const originalHeight = 1080; // Kinect frame height
      const resizedWidth = 1500; // Desired width
      const resizedHeight = 800; // Desired height

      // Create ImageData for the original frame
      const imageData = offscreenCtx.createImageData(originalWidth, originalHeight);
      imageData.data.set(frameData);
      console.log(imageData);
      offscreenCtx.putImageData(imageData, 0, 0);
      // Resize the frame to 1500x800
      const resizedCanvas = document.createElement('canvas');
      const resizedCtx = resizedCanvas.getContext('2d');
      resizedCanvas.width = resizedWidth;
      resizedCanvas.height = resizedHeight;
      resizedCtx.drawImage(
        offscreenCanvas,
        0,
        0,
        originalWidth,
        originalHeight,
        0,
        0,
        resizedWidth,
        resizedHeight
      );
  
      let predictions = await model.estimateHands(resizedCanvas, true);
      if (predictions.length > 0) {
        this.predictions = predictions;
        this.landmarks = predictions[0].landmarks;
        predictions.forEach((prediction) => {
          console.log(prediction);
        });
      }
    };
  
    setupCanvasAndModel = async () => {
      // Create canvases
     /* videoCanvas = document.createElement('canvas');
      videoCanvas.width = 1920;
      videoCanvas.height = 1080;
      videoCtx = videoCanvas.getContext('2d');
      document.body.appendChild(videoCanvas); // Debug: add video canvas to DOM
  
      handCanvas = document.createElement('canvas');
      handCanvas.width = 1920;
      handCanvas.height = 1080;
      handCtx = handCanvas.getContext('2d');
      document.body.appendChild(handCanvas); // Add hand canvas to DOM
  */
      // Load TensorFlow Handpose model
      //this.connectInitialWebSocket();
      offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 1920; // Kinect default width
      offscreenCanvas.height = 1080; // Kinect default height
      offscreenCtx = offscreenCanvas.getContext('2d');
      await tf.ready();
      await tf.setBackend('webgl'); 
      model = await handpose.load();
     // console.log('Handpose model loaded');
      this.connectWebSocket();
    };

    connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8081'); // Connect to backend WebSocket
      ws.binaryType = 'arraybuffer'; // Expect binary data
      ws.onopen = () => console.log('Connected');
      ws.onmessage = async (event) => {
        const frameData = new Uint8Array(event.data);
        await this.processFrame(frameData);
      };
    };

    isPalmFacingDownward(landmarks) {
      const wrist = landmarks[0]; // Wrist
      const palmBase = landmarks[9]; // Middle finger base
     // console.log(wrist, palmBase);
      return (wrist[1] < palmBase[1] && palmBase[1] - wrist[1] < 30); // Wrist higher than palm base
  }


    calculateAngle(point1, point2) {
      const deltaX = point2[0] - point1[0];
      const deltaY = point2[1] - point1[1];
      return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    }
    // operation detection based on gestures with fingerpose library
    detectOp(estimatedGesture) {
      if(estimatedGesture === 'pick gesture') {
        setHandSignal(3)
      }
      else if(this.isPalmFacingDownward(this.landmarks)) {
        //console.log("dowb")
        setHandSignal(6)
      }
      else if(estimatedGesture === 'outstretched_hand') {
        setHandSignal(1)
      }
    }
} 

