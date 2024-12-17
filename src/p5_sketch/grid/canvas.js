import { isolate_signal, move_x_signal, move_y_signal, push_signal, select_signal, selected_count, setPush, setSelectedCount} from "../observer_signal";
import Variable, {variables} from "./variable";

export default class Canvas {
    constructor(p, grid, gl, vertices) {
        this.p = p;
        this.grid = grid;
        this.declared = false;
        this.gl = gl;
        this.vertices = vertices;
    }

    update() {
        // show selected count 
        this.p.textSize(20);
        this.p.fill(255, 255, 255);
        this.p.strokeWeight(1);
       // this.p.text(selected_count(), 1500, 700);
        this.grid.update();
        if(outputs.length != 0) {
            outputs.map((o) => {
                this.p.textSize(20);
                this.p.strokeWeight(1)
                this.p.fill(255);
                this.p.stroke(255);
            //    this.p.text(o[0], o[1], o[2]); ERROR
            })
        }
        // create different types of variables
        if(select_signal() === 1 && !this.declared && selected_count() !== 0) {
            this.createVariable('string', 0)
        }
        else if(select_signal() === 0 && (move_x_signal() === 1 || move_y_signal() === 1)) {
            const v = variables.filter((v) => v.pushed === false);
            if(!!v[0])
                v[0].type = 'int';
        }

        if(variables.length != 0) {
            variables.map((v) => {
              v.update()
            });
          }

        // push variables and reset   
        if(push_signal() === 1) {
            if(isolate_signal() === 1) {
                variables.pop();
            }
            else {
                variables.map((v) => v.pushed = true);
            }
            this.declared = false;
            this.grid.selected_parts = [];
            setSelectedCount(0);
            setPush(0);
        }
 
    }

    createVariable(type, val) {
        const rand_part_x = this.grid.selected_parts[0][0].x;
        const rand_part_y = this.grid.selected_parts[0][0].y;
        const v = new Variable(this.p, rand_part_x, rand_part_y, type, val);
        v.parts = this.grid.selected_parts;
        variables.push(v);
        v.parts.map((part) => part[0].inVar = true);
        this.declared = true;
    }

    removeVariable(v) {
        v.parts.map((part) => part.remove());
        variables.splice(variables.indexOf(v), 1);
    }
}

export var outputs = [];