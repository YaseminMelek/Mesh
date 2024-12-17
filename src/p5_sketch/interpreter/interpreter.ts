import {Operations} from "./instructions.ts"
import Stack from "./stack.ts"
import {  setIsolateSignal, varKey } from "../observer_signal.js";
import { selected_count, op_signal } from "../observer_signal.js";
import Variable, {variables} from "../grid/variable.js";
import { outputs } from "../grid/canvas.js";
export default class Interpreter {
    private stack: Stack;
    private prev: String | Variable;
    private prev_val: Number;
    constructor()  {
        this.stack = new Stack();
        this.prev = '';
        this.prev_val = 0;
    }

    // process push command and add operations and variable keys
    processCommand() {
        if(op_signal() === 'isolate') {
            this.stack.push(op_signal());
        }
        else if(op_signal() === 'select') {
            this.stack.push(varKey());
            const a_var = variables.filter((v) => v.key === varKey());
            const a_val = a_var[0].val;
            this.addHTML(".stack-items", String(varKey()), "var: <span>0</span>", "var (String): " + a_val)
            this.stack.push(op_signal());
            this.addHTML(".stack-items", "op" + String(varKey()) , "Op: <span>0</span>","op: " + op_signal());
        }
        else if(op_signal() === 'move x+' || op_signal() === 'move x-' || op_signal() === 'move y+' || op_signal() === 'move y-') {
            this.stack.push(varKey());
            const a_var = variables.filter((v) => v.key === varKey());
            const a_val = a_var[0].val;
            this.addHTML(".stack-items", String(varKey()), "Var: <span>0</span>", "var (number): " + a_val)
            this.stack.push(op_signal());
            this.addHTML(".stack-items", "op" + String(varKey()) , "Op: <span>0</span>","op: " + op_signal());
        }
    }
    addHTML(query: string,id: string, innerHTML: string, content: string): void {
        // Locate the existing text-section
      /*  const textSection = document.querySelector('.text-section');
        // Create and add the "Op" paragraph
        const pushedOp = document.createElement('p');
        pushedOp.id = 'pushed-op';
        pushedOp.innerHTML = 'Op: <span>0</span>';
        textSection.appendChild(pushedOp);
      
        // Create and add the "Var (string)" paragraph
        const varS = document.createElement('p');
        varS.id = 'varS';
        varS.innerHTML = 'Var (string): <span>0</span>';
        textSection.appendChild(varS);
      
        // Create and add the "Var (number)" paragraph
        const varI = document.createElement('p');
        varI.id = 'varI';
        varI.innerHTML = 'Var (number): <span>0</span>';
        textSection.appendChild(varI);
      
        // Create and add the "Number" paragraph
        const number = document.createElement('p');
        number.id = 'number';
        number.innerHTML = 'Number: <span>0</span>';
        textSection.appendChild(number);*/
        const section = document.querySelector(query);
        const el = document.createElement('p');
        el.id = id;
        el.innerHTML = innerHTML;
        if(!!section)
            section.insertBefore(el, section.firstChild); // Add element at the top
        el.textContent = content;
      }

    // if pop signal is received, interpret the stack instructions 
    interpretCommands() {
        const a = this.stack.pop();
        if(!!a) {
            switch(a) {
                case 'select': {
                    const b = this.stack.peek();
                    if(typeof b === 'number') {
                        this.interpretOp(Operations.op_ascii_value);
                    }
                    break;
                }
                case 'move x-':
                case 'move y-':
                case 'move x+':
                case 'move y+': {
                    const b = this.stack.pop();
                    if(!!this.prev && this.prev === a && this.prev_val != 0 && typeof this.prev_val === 'number' && typeof b === 'number'){
                        this.stack.push(this.prev_val);
                        this.stack.push(b);
                        this.interpretOp(Operations.op_add);
                        this.prev = '';
                        this.prev_val = 0;
                    }
                    else if(!!this.prev && this.prev === this.oppositeOp(a) && this.prev_val != 0 && typeof this.prev_val === 'number' && typeof b === 'number'){
                        this.stack.push(this.prev_val);
                        this.stack.push(b);
                        this.interpretOp(Operations.op_subtract);
                        this.prev = '';
                        this.prev_val = 0;
                    }
                    else if(this.stack.peek() == a || this.stack.peek() == this.oppositeOp(a)) {
                        if(typeof b === 'number') {
                            this.prev_val = b;
                        }
                        if(typeof a === 'string') {
                            this.prev = a;
                        }
                        this.interpretCommands();
                    }
                    else if(this.stack.peek() != a || this.stack.peek() != this.oppositeOp(a)) {
                        const b_var = variables.filter((v) => v.key === b);
                        const b_val = b_var[0].avg_change;
                        b_var[0].remove(b_val);
                        this.addHTML(".outputs", String(b), "Op: <span>0</span>",`${b_val.toFixed(2)}`);
                        const b_el = document.getElementById(String(b));
                        if(!!b_el)
                            b_el.remove();
                        const b_el_op = document.getElementById("op" + String(b));
                        if(!!b_el_op)
                            b_el_op.remove();
                    }
                    break;
                }
                case 'isolate': {
                    setIsolateSignal(2);
                    break;
                }
                case 'add': {
                    this.stack.pop();
                    break;
                }
                default: {
                    outputs.push([a, 500, 500]);
                    break;
                }
            }
        }
        console.log(this.stack);
    }

    interpretOp(op: Operations): void {
        switch (op) {
            case Operations.op_add: {
                const b = this.stack.pop();
                const b_var = variables.filter((v) => v.key === b);
                const b_val = b_var[0].avg_change;
                b_var[0].remove(b_val);
                const a = this.stack.pop();
                const a_var = variables.filter((v) => v.key === a);
                const a_val = a_var[0].avg_change;
                a_var[0].remove(a_val);
                if(typeof a_val === 'number' && typeof b_val === 'number') {
                    this.stack.push(a_val + b_val);
                    this.stack.pop();
                    console.log(this.stack);
                    this.addHTML(".outputs", String(a) + String(b), "Op: <span>0</span>",`addition: ${(a_val + b_val).toFixed(2)}`);
                    const a_el = document.getElementById(String(a));
                    if(!!a_el)
                        a_el.remove();
                    const b_el = document.getElementById(String(b));
                    if(!!b_el)
                        b_el.remove();
                    const a_el_op = document.getElementById("op" + String(a));
                    if(!!a_el_op)
                        a_el_op.remove();
                    const b_el_op = document.getElementById("op" + String(b));
                    if(!!b_el_op)
                        b_el_op.remove();
                }
                else {
                    console.error("addition error");
                }
                break;
            }

            case Operations.op_subtract: {
                const b = this.stack.pop();
                const b_var = variables.filter((v) => v.key === b);
                const b_val = b_var[0].avg_change;
                b_var[0].remove(b_val);
                const a = this.stack.pop();
                const a_var = variables.filter((v) => v.key === a);
                const a_val = a_var[0].avg_change;
                a_var[0].remove(a_val);
                if(typeof a_val === 'number' && typeof b_val === 'number') {
                    this.stack.push(a_val - b_val);
                    this.stack.pop();
                    console.log(this.stack);
                    this.addHTML(".outputs", String(a) + String(b), "Op: <span>0</span>",`subtraction: ${(a_val - b_val).toFixed(2)}`);
                    const a_el = document.getElementById(String(a));
                    if(!!a_el)
                        a_el.remove();
                    const b_el = document.getElementById(String(b));
                    if(!!b_el)
                        b_el.remove();
                    if(!!b_el)
                        b_el.remove();
                    const a_el_op = document.getElementById("op" + String(a));
                    if(!!a_el_op)
                        a_el_op.remove();
                    const b_el_op = document.getElementById("op" + String(b));
                    if(!!b_el_op)
                        b_el_op.remove();
                }
                else {
                    console.error("addition error");
                }
                break;
            }


            case Operations.op_ascii_value: {
                let result = "";
                const a = this.stack.pop();
                const a_var = variables.filter((v) => v.key === a);
                const a_val = a_var[0].val;
                if(typeof a === 'number') {
                    result = String.fromCharCode(a_val) + result;
                    if(result != '') {
                        this.addHTML(".outputs", String(a), "Op: <span>0</span>",`"${result}"`);
                        const el = document.getElementById(String(a));
                        if(!!el)
                            el.remove();
                        a_var[0].remove(result);
                        const a_el_op = document.getElementById("op" + String(a));
                        if(!!a_el_op)
                            a_el_op.remove();
                    }
                }
                else {
                    console.error("ascii error")
                }
                break;
            }
        }
    }

    oppositeOp(op: any) {
        if(op === 'move x+') {
            return 'move x-'
        }
        else if(op === 'move x-') {
            return 'move x+'
        }
        else if(op === 'move y-') {
            return 'move y+'
        }
        else if(op === 'move y+') {
            return 'move y-'
        }
    }
}

