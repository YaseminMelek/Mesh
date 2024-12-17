import p5 from "p5";
import IsolatedSegment from "./isolated_segment";
import { push_signal, setOpSignal, isolate_signal, setIsolateSignal, move_x_signal, move_y_signal, dup_signal} from "../observer_signal";
import { Vec2D } from "toxiclibsjs/geom";
import { variables } from "./variable";

export default class Grid {
  constructor(p, inter, factory) {
    this.p = p;
    this.part_array = [];
    this.inter = inter;
    this.isolated_segs = [];
    this.factory = factory;
    this.selected_parts = [];
    this.handdetect = factory.handdetect;
    this.gl = factory.gl;
    this.vertices = factory.vertices;
    this.springs = factory.springs;
    this.springs_pos = factory.springs_pos;
    this.brush = factory.brush;
    this.buffer = factory.buffer;
  }

  updateLines() {
    // Convert lines to flat vertex array
    let vertices = [];
    this.springs.forEach((spring) => {
    //  springs_pos.push([spring.a.x, spring.a.y, spring.b.x, spring.b.y]);
      vertices.push(this.toWebGLCoords(spring.a.x, spring.a.y, spring.col),this.toWebGLCoords(spring.b.x, spring.b.y, spring.col));
    });
 /*   springs_pos.forEach(([x1,y1,x2,y2]) => {
      vertices.push(this.toWebGLCoords(x1, y1),
      this.toWebGLCoords(x2, y2));
    });*/
    vertices = vertices.flat();
    /*// Bind buffer and upload data
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW);
    this.gl.drawArrays(this.gl.LINES, 0, vertices);*/
    return vertices;
  }
  toWebGLCoords(x, y, color) {
    const webGLX = (x / this.p.width) * 2 - 1; // Normalize X to [-1, 1]
    const webGLY = -((y / this.p.height) * 2 - 1); // Normalize Y to [-1, 1] and flip Y-axis

    return [webGLX, webGLY, this.p.red(color) / 255, this.p.green(color) / 255, this.p.blue(color) / 255]
  /*  this.p.noFill();
    this.p.beginShape(this.p.LINES)
    this.springs.forEach((spring) => {
      this.p.stroke(spring.col);
      this.p.vertex(spring.a.x, spring.a.y);
      this.p.vertex(spring.b.x, spring.b.y);
      //this.brush.stroke(spring.col);
      //this.brush.line(spring.a.x, spring.a.y, spring.b.x, spring.b.y);
    })
    this.p.endShape();*/
  }
  update() {
   // this.updateLines();
    // checks bounds in case isolate
    const bounds = this.checkBounds();
    const start_x = bounds[0];
    const end_x = bounds[1];
    const start_y = bounds[2];
    const end_y = bounds[3];
    for (let x = 0; x < this.part_array.length; x++) {
      for (let y = this.part_array[x].length - 1; y >= 0; y--) {
        //lock the 4 corners of the grid
          if(x == 0  ||  x == this.part_array.length - 1 || y == 0 || y == this.part_array[x].length - 1) {
            this.part_array[x][y].lock();
          }  
          else if(!this.part_array[x][y].isSelected && this.part_array[x][y].inVar){
           // this.part_array[x][y].lock();
          } 
          // checks whether in bounds: if yes check interaction, if no lock (for isolation)
          if(x >= start_x && x <= end_x && y >= start_y && y <= end_y) {
            this.checkInteractions(this.part_array[x][y], x, y);
            if (push_signal() === 1) {
                this.pushInteraction(this.part_array[x][y], x, y);
            }
          } 
          else {
            this.part_array[x][y].lock();
          }
          if(!!this.part_array[x][y]) {
            this.part_array[x][y].update_part(); 
          }
      }
    }
    // if isolated segment is popped
    if(isolate_signal() === 2) {
      if(this.isolated_segs.length != 0) {
        const seg = this.isolated_segs[this.isolated_segs.length - 1]; 
        const prev_seg = this.isolated_segs[this.isolated_segs.length - 2]; 
        if(!!prev_seg) {
          seg.partlist.map((p) => {
            if(!p.isSelected)
              p.changeColor(prev_seg.col)
          })
        }
        else {
          seg.partlist.map((p) => p.reset())
        }
      }
      this.isolated_segs.pop();
      setIsolateSignal(0)
    }
  }

  // select linked parts when selecting entire rows and columns
  selectParts(spring) {
    if (spring.a === spring.b.ptr_u || spring.a == spring.b.ptr_d) {
      let part = spring.a;
      while (!!part.ptr_d) {
        part.ptr_d.select(this.selected_parts);
        let s = part.spring_list.filter(
          (s) => s.a == part && s.b == part.ptr_d
        );
        if (!!s[0]) {
          s[0].select(this.selected_parts);
        }
        part = part.ptr_d;
      }
      part = spring.a;
      while (!!part.ptr_u) {
        part.ptr_u.select(this.selected_parts);
        let s = part.spring_list.filter(
          (s) => s.b == part && s.a == part.ptr_u
        );
        if (!!s[0]) {
          s[0].select(this.selected_parts);
        }
        part = part.ptr_u;
      }
    }
    if (spring.a === spring.b.ptr_r || spring.a === spring.b.ptr_l) {
      let part = spring.a;
      while (!!part.ptr_l) {
        part.ptr_l.select(this.selected_parts);
        let s = part.spring_list.filter(
          (s) => s.b == part && s.a == part.ptr_l
        );
        if (!!s[0]) {
          s[0].select(this.selected_parts);
        }
        part = part.ptr_l;
      }
      part = spring.a;
      while (!!part.ptr_r) {
        part.ptr_r.select(this.selected_parts);
        let s = part.spring_list.filter(
          (s) => s.a == part && s.b == part.ptr_r
        );
        if (!!s[0]) {
          s[0].select(this.selected_parts);
        }
        part = part.ptr_r;
      }
    }
  }

  checkBounds() {
    let start_x, end_x, end_y, start_y;
    if (this.isolated_segs.length != 0) {
        const seg = this.isolated_segs[this.isolated_segs.length - 1];
        if(seg.start_x === -1) {
          seg.start_x = this.inter.closest_start_index_x;
          seg.start_y = this.inter.closest_start_index_y;
          seg.end_x = this.inter.closest_end_index_x;
          seg.end_y = this.inter.closest_end_index_y;
          seg.partlist.map((p) => {
            p.bounds_x_start = this.part_array[seg.start_x][seg.start_y].x;
            p.bounds_x_end = this.part_array[seg.end_x][seg.start_y].x;
            p.bounds_y_start = this.part_array[seg.start_x][seg.start_y].y;
            p.bounds_y_end = this.part_array[seg.start_x][seg.end_y].y;
          })
        }
        start_x = seg.start_x;
        start_y = seg.start_y;
        end_x = seg.end_x;
        end_y = seg.end_y;
    } else {
      start_x = 0;
      end_x = this.part_array.length;
      start_y = 0;
      end_y = this.part_array[0].length;
    }
    return [start_x, end_x, start_y, end_y]
  }


  checkInteractions(part, x, y) {
    if(part.remove_from_grid) {
      this.part_array[x].splice(y, 1);
    }
    if (!part.isSelected) {
      this.selectPoints(part, x, y)
    }
    // to move
    if (part.isSelected && (move_x_signal() === 1 || move_y_signal() === 1)) {
      let p;
      if(!!this.handdetect.x && !!this.handdetect.y && !!this.handdetect.prev_x && !!this.handdetect.prev_y) {
        if(!!this.handdetect.landmarks.length != 0) {
         p = p5.Vector.sub(this.p.createVector(this.handdetect.x, this.handdetect.y), this.p.createVector(this.handdetect.prev_x, this.handdetect.prev_y));
         //p = p5.Vector.mult(p, 5);
        }
      }
      else {
        p = p5.Vector.sub(
          this.p.createVector(this.p.mouseX, this.p.mouseY),
          this.p.createVector(this.p.pmouseX, this.p.pmouseY)
        );
      }
      if (((!!part.ptr_d && part.ptr_d.isSelected) || (!!part.ptr_u && part.ptr_u.isSelected)) && move_x_signal() === 1) {
        part.moveHorizontal(p.x);
        const diff = part.x - part.before_move.x;
        if(diff < 0) {
          setOpSignal('move x-');
        }
        else {
          setOpSignal('move x+');
        }
      }
      if (((!!part.ptr_r && part.ptr_r.isSelected) || (!!part.ptr_l && part.ptr_l.isSelected)) && move_y_signal() === 1) {
        part.moveVertical(p.y); 
        const diff = part.y - part.before_move.y;
        if(diff < 0) {
          setOpSignal('move y-');
        }
        else {
          setOpSignal('move y+');
        }
      }
    }
    // to duplicate
    else if (part.isSelected && dup_signal() === 1) {
        if(!!part.ptr_r && part.ptr_r.ptr_d === null && part.ptr_r.isSelected) {
            const spring = part.spring_list.filter((s) => {
              return (!!s.a && !!s.b && (s.a === part && s.b === part.ptr_r) || (s.b === part && s.a === part.ptr_r))
            })
            if(spring.length != 0) {
              this.factory.duplicate(spring[0], this.part_array, 'down', x, y);
            }
          }
        else if(!!part.ptr_r && part.ptr_r.ptr_u === null && part.ptr_r.isSelected) {
            const spring = part.spring_list.filter((s) => {
              return (!!s.a && !!s.b && (s.a === part && s.b === part.ptr_r) || (s.b === part && s.a === part.ptr_r))
            })
            if(spring.length != 0) 
              this.factory.duplicate(spring[0], this.part_array, 'up', x, y);
        }
        else if(!!part.ptr_u && part.ptr_u.ptr_r === null && part.ptr_u.isSelected) {
            const spring = part.spring_list.filter((s) => {
              return (!!s.a && !!s.b && (s.a === part && s.b === part.ptr_u) || (s.b === part && s.a === part.ptr_u))
            })
            if(spring.length != 0) 
              this.factory.duplicate(spring[0], this.part_array, 'right', x, y);
          }
        else if(!!part.ptr_u && part.ptr_u.ptr_l === null && part.ptr_u.isSelected) {
            const spring = part.spring_list.filter((s) => {
              return (!!s.a && !!s.b && (s.a === part && s.b === part.ptr_u) || (s.b === part && s.a === part.ptr_u))
            })
            if(spring.length != 0) 
              this.factory.duplicate(spring[0], this.part_array, 'left', x,y);
        }
        part.deselect();
    }
  }

  selectPoints(part) {
     // select area
     if (this.inter.area.length != 0 && this.inter.selectArea) {
      if(part.checkInteractionArea(this.inter.area, this.selected_parts)) {
        if(!!part.inVar && !part.isIsolated) { // ?? METHOD IN PARTICLE CLASS
          const v = variables.filter((v) => v === part.inVar);
          v[0].selectAll();
        }
      }  
    }
     // select lines
     else if (this.inter.selectLines) {
      let selected = part.checkInteractionPt(this.inter.interPt, this.selected_parts);
      if (selected != 0) {
        this.selectParts(selected);
      }
    }
    // select pts
    else if (this.inter.select) {
      if(this.inter.interPt.x !== 0 && this.inter.interPt.y !== 0) {
        if(part.checkInteractionPt(this.inter.interPt, this.selected_parts) != 0) {
          if(!!part.inVar && !part.isIsolated) { // THIS IS A REPEAT
            const v = variables.filter((v) => v === part.inVar);
            //v[0].selectAll();
          }
        }
      }
      if (this.handdetect.predictions.length > 0) {
        //for(let i = 0; i < this.handdetect.predictions[0].landmarks.length; i++) {
          if(part.checkInteractionPt(this.p.createVector(this.handdetect.predictions[0].landmarks[8][0], this.handdetect.predictions[0].landmarks[8][1]), this.selected_parts) != 0) {
            if(!!part.inVar && !part.isIsolated) {
              const v = variables.filter((v) => v === part.inVar);
            //  v[0].selectAll();
            }
          }
        //}
      }  
    }
    //pink collision points
    else if (this.selected_parts.length != 0) {
      this.selected_parts.map((r) => {
        let vec = new Vec2D(part.x, part.y);
        if(r[1].containsPoint(vec)) {
          part.p.strokeWeight(10);
          part.stroke_col = this.p.color(255, 0, 255);
          r[0].lockp = true;
          r[0].col_part = part;
        }
      })
    }
  }

  pushInteraction(part, x, y) {
    // isolate segment
    if (isolate_signal() === 1 && this.inter.area.length != 0) {
      const seg = new IsolatedSegment(
        this.p,
        this.inter.area[0],
        this.inter.area[2],
        this.p.color(this.p.random(0, 255), this.p.random(0, 255), 0),
        -1,
        -1,
        -1,
        -1
      );
      this.isolated_segs.push(seg);
      this.inter.area = []
      this.inter.closest_end_dist = 10000;
      this.inter.closest_start_dist = 10000;
    }
    // check and add particles to the isolated segment 
    else if (isolate_signal() === 1 && part.isSelected && this.isolated_segs.length != 0) {
      const seg = this.isolated_segs[this.isolated_segs.length - 1];
      let dist = p5.Vector.sub(this.p.createVector(part.x, part.y), seg.start_pt).mag();
      if(dist < this.inter.closest_start_dist) {
          this.inter.closest_start_index_x = x;
          this.inter.closest_start_index_y = y;
          this.inter.closest_start_dist = dist;
      }
      dist = p5.Vector.sub(this.p.createVector(part.x, part.y), seg.end_pt).mag();
      if(dist < this.inter.closest_end_dist) {
          this.inter.closest_end_index_x = x;
          this.inter.closest_end_index_y = y;
          this.inter.closest_end_dist = dist;
      }
      part.isolate();
      seg.partlist.push(part);
      part.changeColor(seg.col)
    }  
    else if (part.isSelected) {
      part.deselect();
      this.inter.area = []
    }
  }
}
