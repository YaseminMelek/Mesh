import express from "express"
import Kinect2 from "kinect2";
import cors from 'cors';
import WebSocket, {WebSocketServer} from "ws";

export const kinect = new Kinect2();
const wss = new WebSocketServer({port: 8081});
let previousLeftAngle = null;
let previousRightAngle = null;
let cumulativeLeftAngle = 0;
let cumulativeRightAngle = 0;
let isRotating = false;
const rotationThreshold = 250; 
let previousZ = null; 
const thresholdZ = 0.1; 
const pushSpeedZ = 0.02;
const app = express();
const directionBuffer = []; 

app.use(cors())
let latestBodyData = null;
if (kinect.open()) {
  console.log('Kinect Opened');
  kinect.openBodyReader();
  kinect.on('bodyFrame', (bodyFrame) => {
    bodyFrame.bodies.forEach((body) => {
      if (body.tracked) {
        const wrist = body.joints[Kinect2.JointType.wristLeft];
        const leftHand = body.joints[Kinect2.JointType.handLeft];
        const rightHand = body.joints[Kinect2.JointType.handRight];
        if (wrist && leftHand) {
          const smoothedWrist = smoothJoint(wrist);
          const smoothedLeftHand = smoothJoint(leftHand);
          const smoothedRightHand = smoothJoint(rightHand);
          if (isWithinBoundingBox(smoothedWrist) && isWithinBoundingBox(smoothedRightHand)) {
            const currentAngle = calculateAngle(smoothedWrist, smoothedRightHand);
            if (previousRightAngle !== null) {
                let deltaAngle = currentAngle - previousRightAngle;
                if (deltaAngle > 180) deltaAngle -= 360;
                if (deltaAngle < -180) deltaAngle += 360;
                cumulativeRightAngle += deltaAngle;
                const direction = deltaAngle > 0 ? 1 : -1;
                directionBuffer.push(direction);
                if (directionBuffer.length > 10) {
                  directionBuffer.shift();
                }
                const isConsistentRotation = directionBuffer.every((dir) => dir === direction);

                if (Math.abs(cumulativeRightAngle) >= rotationThreshold && isConsistentRotation) {
                  isRotating = true;
                  const data = JSON.stringify({ isRotating: isRotating });
                  wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                  isRotating = false;
                });
                  cumulativeRightAngle = 0;
                  directionBuffer.length = 0;
                }

              }
              previousRightAngle = currentAngle;
          }
          if (isWithinBoundingBox(smoothedWrist) && isWithinBoundingBox(smoothedLeftHand)) {
            const currentAngle = calculateAngle(smoothedWrist, smoothedLeftHand);
            if (previousLeftAngle !== null) {
                let deltaAngle = currentAngle - previousLeftAngle;
                if (deltaAngle > 180) deltaAngle -= 360;
                if (deltaAngle < -180) deltaAngle += 360;
                cumulativeLeftAngle += deltaAngle;
                const direction = deltaAngle > 0 ? 1 : -1;
                directionBuffer.push(direction);
                if (directionBuffer.length > 10) {
                  directionBuffer.shift();
                }
                const isConsistentRotation = directionBuffer.every((dir) => dir === direction);

                if (Math.abs(cumulativeLeftAngle) >= rotationThreshold && isConsistentRotation) {
                  console.log(`Circular rotation detected: ${cumulativeLeftAngle.toFixed(2)}° (${direction > 0 ? 'Clockwise' : 'Counter-clockwise'})`);
                  isRotating = true;
                  const data = JSON.stringify({ isRotating: isRotating });
                  wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                  isRotating = false;
                });
                  cumulativeLeftAngle = 0;
                  directionBuffer.length = 0;
                }

              }
              previousLeftAngle = currentAngle;
          }
          else {
            cumulativeLeftAngle = 0;
            directionBuffer.length = 0;
            previousLeftAngle = null;
            isRotating = false;
          }
        }
      }
    });
  });
}
else {
  console.error('Failed to open Kinect.');
}


const boundingBox = {
  minX: -0.3,
  maxX: 0.3,
  minY: -0.3,
  maxY: 0.3,
  minZ: 0.5,
  maxZ: 1.5, 
};
function isWithinBoundingBox(joint) {
  return (
    joint.cameraX >= boundingBox.minX &&
    joint.cameraX <= boundingBox.maxX &&
    joint.cameraY >= boundingBox.minY &&
    joint.cameraY <= boundingBox.maxY
  );
}
// Function to detect push gesture
function detectPushGesture(currentZ) {
  if (previousZ !== null) {
      const deltaZ = previousZ - currentZ; 

      if (deltaZ > thresholdZ && deltaZ / (1 / 30) > pushSpeedZ) {
          console.log('Push gesture detected'); 
      }
  }
  previousZ = currentZ;
}

function calculateAngle(wrist, hand) {
  const deltaX = hand.cameraX - wrist.cameraX;
  const deltaY = hand.cameraY - wrist.cameraY;
  return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
}
const jointHistory = []; 
const maxHistory = 5; 
function smoothJoint(currentJoint) {
  jointHistory.push(currentJoint);
  if (jointHistory.length > maxHistory) {
    jointHistory.shift();
  }
  const averageJoint = {
    cameraX: jointHistory.reduce((sum, joint) => sum + joint.cameraX, 0) / jointHistory.length,
    cameraY: jointHistory.reduce((sum, joint) => sum + joint.cameraY, 0) / jointHistory.length,
    cameraZ: jointHistory.reduce((sum, joint) => sum + joint.cameraZ, 0) / jointHistory.length,
  };

  return averageJoint;
}

function createVector(joint1, joint2) {
  return [
    joint2.cameraX - joint1.cameraX,
    joint2.cameraY - joint1.cameraY,
    joint2.cameraZ - joint1.cameraZ
  ];
}

app.get('/api/kinect-data', (req, res) => {
  if (latestBodyData) {
    res.json(latestBodyData);
  } else {
    res.json({ wrist: null, hand: null });
  }
});
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});