import { selected_count, push_signal, pop_signal, setPop, op_signal, setKeyInput, currentKeyInput, setPush, setOpSignal, setMoveXSignal, setMoveYSignal, setIsolateSignal, setDupSignal, setCutSignal, setSelect, handSignal, setHandSignal, currentVal, setCurrentVal} from "./p5_sketch/observer_signal.js";
import msketch from "./p5_sketch/sketch.js"; // Import the p5 sketch
import P5Wrapper from "./p5_wrapper.jsx";
import { createEffect, createRoot } from "solid-js";
import Interpreter from "./p5_sketch/interpreter/interpreter.ts";
import { variables } from "./p5_sketch/grid/variable.js";

const App = () => {
  const interpreter = new Interpreter();

  // trigger push 
  createEffect(() => {
    if(push_signal() === 1 && op_signal() !== '') {
      interpreter.processCommand();
      setMoveXSignal(0);
      setMoveYSignal(0);
      setDupSignal(0);
      setSelect(0);
      setOpSignal('');
    }
  })
  createEffect(() => {
    if(currentVal() == -1) {
      const el = document.getElementById("currentVal");
      el.remove();
      setCurrentVal(0);
    }
    else if(currentVal() != 0) {
      const section = document.querySelector(".current");
      if(document.getElementById("currentVal") === null) {
        const el = document.createElement('p');
        el.id = "currentVal";
        if(!!section)
            section.appendChild(el);
        el.textContent = "move value: " + currentVal().toFixed(2); 
      }
      else {
        const el = document.getElementById("currentVal");
        el.textContent = "move value: " + currentVal().toFixed(2); 
      }  
    }
  })

  createEffect(() => {
    document.getElementById('num-points').querySelector('span').textContent = selected_count();
  })

  createEffect(() => {
    document.getElementById('op').querySelector('span').textContent = op_signal();
  })
  createEffect(() => {
   /* if(handSignal() !== 0) {
      const input = handSignal();
      let prev_k = currentKeyInput();
      let currentk = input;
      setKeyInput(Number(currentk));
      handleInteraction(currentk, prev_k);
    }8?*/
  })

  // trigger pop
  createEffect(() => {
    if(pop_signal() === 1 && op_signal() !== '') {
      interpreter.interpretCommands();
      setOpSignal('');
      setPop(0);
    }
  })

  const handleInteraction = (currentk, prev_k) => {
    document.getElementById(currentk.toString()).className = "buttoncut";
    document.getElementById(prev_k.toString()).className = "button";
    send1Signal(currentk)
  };

  function addHTML(query, id, innerHTML) {
    const section = document.querySelector(query);
    const el = document.createElemtent('p');
    el.id = id;
    el.innerHTML = innerHTML;
    section.appendChild(el);
  }
  

  const handleKeyInput = (event) => {
    setHandSignal(0);
    const key = event.key;
    switch (key) {
      case 'ArrowRight': {
        let currentk;
        let prev_k;
        if(currentKeyInput() == 4 || currentKeyInput() == 5) {
          break;
        }else {
          console.log(currentKeyInput())
          if(currentKeyInput() == 3) 
            setKeyInput(1)
          else {
            setKeyInput(currentKeyInput() + 1)
          }
          if(currentKeyInput() == 1) {
            prev_k = 3;
            currentk = 1;
          }else {
            currentk = currentKeyInput()
            prev_k = currentKeyInput() - 1
          }
          handleInteraction(currentk, prev_k);
        }

        break;
      }
      case "ArrowLeft": {
        let currentk;
        let prev_k;
        if(currentKeyInput() == 4 || currentKeyInput() == 5) {
          break;
        }else {
          if(currentKeyInput() == 1) 
            setKeyInput(3)
          else 
            setKeyInput(currentKeyInput() - 1)
          if(currentKeyInput() == 3) {
            prev_k = 1;
            currentk = 3;
          }else {
            currentk = currentKeyInput()
            prev_k = currentKeyInput() + 1
          }
          handleInteraction(currentk, prev_k)
        }
        break;
      }
      case "Enter": {
        let prev_k = currentKeyInput();
        let currentk = 4;
        setKeyInput(4)
        handleInteraction(currentk, prev_k);
        break;
      }
      case "p":
        case "P": {
        let prev_k = currentKeyInput();
        let currentk = 5;
        setKeyInput(5)
        handleInteraction(currentk, prev_k);
      }
    }
  };
  setInterval(() => {
    variables.forEach((variable) => {
      const key = String(variable.key);
      if(!!document.getElementById(key)) {
        document.getElementById(key).textContent = "var (num):" + variable.val.toFixed(2);
      }
    });
  }, 100);

  const handleClick = (event) => {
    setHandSignal(0);
    const input = event.target.id;
    let prev_k = currentKeyInput();
    let currentk = input;
    setKeyInput(Number(currentk));
    handleInteraction(currentk, prev_k);
  }

  const send1Signal = (id) => {
    switch (id) {
      case 1: 
      case '1':{
        setSelect(1);
        setIsolateSignal(0);
        setMoveXSignal(0);
        setMoveYSignal(0);
        setOpSignal('select');
        break;
      } 
      case 2: 
      case '2':{
        setMoveXSignal(1);
        setMoveYSignal(0);
        setSelect(0);
        setIsolateSignal(0);
        setOpSignal('move x');
        break;
      }
      case 3: 
      case '3':{
        setMoveYSignal(1);
        setMoveXSignal(0);
        setSelect(0);
        setIsolateSignal(0);
        setOpSignal('move y');
        break;
      }
      case 4: 
      case '4':{
        setPush(1);
        break;
      } 
      case 5: 
      case '5':{
        setPop(1);
        setOpSignal('pop');
        break;
      } 
    }
  }
/*
overflow-x: hidden;
  overflow-y: hidden;
*/
  window.addEventListener("keydown", handleKeyInput);

  return (
    <div class="container">
  <div class="p5-wrapper">
    <P5Wrapper sketch={msketch} />
      <div class="button-group">
        <button id="1"onClick={handleClick}>Select</button>
        <button id="2" onClick={handleClick}>Move Horizontal</button>
        <button id="3" onClick={handleClick}>Move Vertical</button>
        <button id="4" onClick={handleClick}>Push</button>
        <button id="5" onClick={handleClick}>Cut (Pop)</button>
      </div>
      <div class="button-group">
    </div>
  </div>
  <div class="text-section">
  <h2>Instructions</h2>
  <div class="divider"></div>
    <p>Disrupt the grid's structure to perform operations. Each disruption irreversibly transforms the grid</p>
    <p>This is a stack-based language Push operations and variables Pop (Cut) to print outputs</p>
    <p>Select and push for strings</p>
    <p>Select, move and push for numbers</p>

    <p></p>
    <h2>Current Disruptions</h2>
    <div class="divider"></div>
    <div class="current">
      <p id="num-points">selected number of points: <span>0</span></p>
      <p id="op">current operation: <span>0</span></p>
    </div>
    <h2>Stack Items</h2>
    <div class="divider"></div>
    <div class="stack-items">
    </div>
    <h2>Outputs</h2>
    <div class="divider"></div>
    <div class="outputs">
    </div>
  </div>
  </div>
  
  );
};

export default App;