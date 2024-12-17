import { currentVal, selected_count, setCurrentVal, setVarKey } from "../observer_signal";
import { outputs } from "./canvas";

export default class Variable {
    constructor(p, x, y, type, val) {
        this.p = p;
        this.x = x; 
        this.y = y;
        this.tot_change = 0;
        this.avg_change = 0;
        this.parts = [];
        this.pushed = false;
        this.type = type;
        this.val = val;
        this.t = 0;
        this.key = Math.random(0, 100);
        this.col = p.color(p.random(0, 255), p.random(0, 255), p.random(0, 255));
    }

    display() {
//        this.p.textSize(20);
      //  this.p.strokeWeight(1)
      //  this.p.fill(this.col);
        this.p.textFont('Arial')
        this.p.textSize(32);
        this.p.textAlign(this.p.CENTER, this.p.CENTER);
       /* if(this.type === 'int')
            this.p.text(this.avg_change.toFixed(2), this.x, this.y); */
    }

    selectAll() {
        this.parts.map((p) => {
            p[0].select();
        });
    }

    remove(print) {
        outputs.push([print, this.x, this.y]);
        this.parts.map((part) => part[0].remove());
        variables.splice(variables.indexOf(this), 1);
    }

    update() {
       if(!this.pushed) {
        setVarKey(this.key);
       }
       else if(this.pushed && currentVal() !== 0) {
        setCurrentVal(-1);
       }
        // avg coordinate change for numbers
       if(this.type === 'int') {

        this.parts.map((part) => {
            let c = part[0].calculateChange();
            this.tot_change += c;
            if(!part[0].isSelected) {
                part[0].changeColor(this.col)
                if(this.pushed) {
                  /*  if(this.t > 0 && this.p.millis() - this.t > 100) {
                        part[0].lock();
                    }
                    this.t = this.p.millis();*/
                }
            }
        });
        this.avg_change = this.tot_change / this.parts.length;
        if(!!this.avg_change && this.avg_change > 0)
            this.display();
        this.tot_change = 0;
        this.val = this.avg_change;
        if(!this.pushed) {
            setCurrentVal(this.val);
            this.parts.map((part) => part[0].changeColor(this.p.color(128, 0, 32)))
        }
        if(this.pushed) {
            this.parts.map((part) => part[0].changeColor(this.p.color(255, 0, 0)))
        }
    }
       else if(this.type === 'string') {
        if(!this.pushed) {
            this.val = selected_count();
        }
        else {
            this.parts.map((part) => part[0].changeColor(this.p.color(255, 0, 0)))
          //  this.parts.map((part) => part[0].changeColor(this.p.color(255, 0, 0)))
        }
        this.display();
       }
    }
}

export var variables = [];