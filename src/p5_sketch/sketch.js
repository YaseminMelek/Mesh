import { Rect } from "toxiclibsjs/geom.js";
import { VerletPhysics2D } from "toxiclibsjs/physics2d.js";
import Factory from "./grid/factory.js";
import Interaction from "./grid/interaction.js";
import HandDetect from "../handpose/handdetect.js";
import { setHandSignal } from "./observer_signal.js";
import * as brush from "p5.brush";

export default function msketch(p) {
  let factory, canv, inter, center, seg_len = 20, hand_detect;
  let vertices = [];
  let gl, buffer, program, positionLocation, colorLocation, font, kinectData;
  let isRotating = false;
  // Vertex and Fragment Shaders
  const vertexShaderSource = `
    /*precision highp float;
    attribute vec2 offset;
    uniform float thickness;
    uniform mat4 projectionMatrix;
    varying float vDistance;*/

    attribute vec2 position;
    attribute vec3 color;
    varying vec3 vColor;

    void main() {
      vColor = color;
      //vec2 adjustedPosition = position + offset * thickness * 0.5;
      //vDistance = length(offset);
      gl_PointSize = 10.0; 
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;
    //uniform float thickness; 
    //varying float vDistance;
    void main() {
      /*if (vDistance > thickness * 0.5) {
          discard;
      }
      float alpha = smoothstep(thickness * 0.5 - 0.01, thickness * 0.5, vDistance);*/
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  let socket;
  p.setup = function () {
    //socket = new WebSocket('ws://localhost:8081');
     // Listen for messages from the server
    /* socket.onmessage = (event) => {
        const data = JSON.parse(event.data); // Parse the JSON data
        isRotating = data.isrotating; // Update the variable
        console.log('Received data from server:', data);
    };

    // Handle WebSocket errors
    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };*/
      // Setup canvas and WebGL
    p.createCanvas(1400, 888, p.WEBGL);
    gl = p._renderer.GL;
   // p.textFont(font);
    p.textSize(20);
    p.textAlign(p.CENTER, p.CENTER);    // Align text to the center

    // Compile and link shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    // Create and bind buffer
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Set up position and color attributes
    positionLocation = gl.getAttribLocation(program, "position");
    colorLocation = gl.getAttribLocation(program, "color");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

    // Initialize physics and other components
    center = p.createVector(0, 0);
    window.physics = new VerletPhysics2D();
    window.physics.setWorldBounds(new Rect(-p.width, -p.height, p.width * 2, p.height * 2));

    hand_detect = new HandDetect();
    hand_detect.setupHandpose();

    factory = new Factory(p, 71, 45, seg_len, hand_detect, brush, gl, vertices);
    inter = new Interaction(p);
    canv = factory.createCanvas(inter);

    brush.seed(1233);
  };

  p.draw = function () {
    /*socket.onmessage = (event) => {
      const data = JSON.parse(event.data); // Parse the JSON data
      isRotating = data.isrotating; // Update the variable
      setHandSignal(5)
      console.log('Received data from server:', data);
    };8?*/

  // Handle WebSocket errors
   /* socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    //
   /*if (p.frameCount % 10 === 0) { // Fetch data every 30 frames
      p.loadJSON('http://localhost:8080/api/kinect-data', (data) => {
        kinectData = data;
        console.log(data);
        if(data.isRotating && !isRotating) {
          setHandSignal(5)
          isRotating = true;
        }
        else if(!data.isRotating) {
          isRotating = false;
        }
      });
    }
  */
    p.background(0);
    p.translate(-p.width / 2, -p.height / 2);

    // Update vertices (positions and colors)
    vertices = factory.grid.updateLines(); // Ensure this includes positions + colors
    let line_count = vertices.length;
    //console.log(vertices);
     // Draw hand landmarks
     if (hand_detect.predictions.length > 0) {
      hand_detect.predictions[0].landmarks.forEach((landmark) => {
        vertices.push(toWebGLCoords(landmark[0], landmark[1], p.color(0, 255, 0)));
        //console.log(landmark);
      });
      vertices = vertices.flat();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
    gl.useProgram(program);
    gl.drawArrays(gl.LINES, 0, line_count / 5); 
    if(hand_detect.predictions.length > 0) {
      gl.drawArrays(gl.POINTS, line_count / 5, (vertices.length - line_count) / 5); 
    }
    inter.update();
    canv.update();
    window.physics.update();

  };

  // Helper to create a shader
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  function toWebGLCoords(x, y, color) {
    const webGLX = (x / p.width) * 2 - 1; // Normalize X to [-1, 1]
    const webGLY = -((y / p.height) * 2 - 1); // Normalize Y to [-1, 1] and flip Y-axis
    return [webGLX, webGLY, p.red(color) / 255, p.green(color) / 255, p.blue(color) / 255]
  }


  // Helper to create a program
  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }
}
