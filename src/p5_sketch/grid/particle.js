import p5 from "p5";
import {Rect, Vec2D} from "toxiclibsjs/geom.js";
import { VerletParticle2D } from "toxiclibsjs/physics2d.js";
import { AttractionBehavior } from "toxiclibsjs/physics2d/behaviors";
import SAT from "sat";
import { push_signal, selected_count, setSelectedCount } from "../observer_signal";

export default class Particle extends VerletParticle2D{
    constructor(p, x,y, brush) {
        super(x,y);
        this.p = p;
        this.bounds_x_start = 0;
        this.bounds_x_end = this.p.width;
        this.bounds_y_start = 0;
        this.inVar = false;
        this.bounds_y_end = this.p.height;
        this.col = this.p.color(0, 0, 0);
        this.spring_list = [];
        this.isSelected = false;
        this.isIsolated = false;
        this.ptr_l = null;
        this.ptr_r = null;
        this.ptr_u = null;
        this.ptr_d = null;
        this.lockp = false;
        this.attr_mag = 0;
        this.duplicate_x = false;
        this.remove_from_grid = false;
        this.duplicate_y = false;
        this.stroke_col = this.p.color(255,255,255);
        this.physics = window.physics;
        this.col_area = new Rect(-1, -1, -1, -1);
        this.col_part = null;
        this.before_move = p.createVector(x,y);
        this.after_move = p.createVector(0,0);
        this.f = new AttractionBehavior(this, 50, 0, 0);
   //     this.physics.addBehavior(this.f);
        this.f_start = 0;
        this.brush = brush;
    }

    update_part() {
        if(this.inVar) {
           // console.log("hi")
        }
        if(this.p.millis() - this.f_start > 1000 && this.f_start > 0) {
            this.physics.removeBehavior(this.f);
            this.f_start = 0;
        } 
        this.after_move = this.p.createVector(this.x, this.y);
        if(!!this.col_part) {
            this.checkCollision(this.col_part);
            if(this.lockp) {
                this.lock();
            }
            else {
                this.unlock();
            }  
        }
        if(this.duplicate_x) {
            this.y = this.p.mouseY;
            if(this.p.mouseIsPressed) {
                this.duplicate_x = false;
                this.y = this.p.mouseY
            }
        }
        if(this.duplicate_y) {
            this.x = this.p.mouseX;
            if(this.p.mouseIsPressed) {
                this.duplicate_y = false;
                this.x = this.p.mouseX;
            }
        }
        if(this.isSelected) {
            this.col_area.x = this.x - 10;
            this.col_area.y = this.y - 10;
            this.col_area.width = 20;
            this.col_area.height = 20;
        }
       this.display();
       if(!!this.spring_list[0]) {
            this.spring_list[0].update_spring();
            if(!!this.spring_list[1])
                this.spring_list[1].update_spring();
       }
       if(this.isSelected)
            this.after_move = this.p.createVector(this.x, this.y);
    }

    //check collision with selection area
    checkInteractionArea(area, selected_parts) {
        let pt1 = new SAT.Vector(area[0].x, area[0].y)
        let box = new SAT.Box(pt1, area[1].x, area[1].y)
        let pt_sat = new SAT.Vector(this.x, this.y)
        if(SAT.pointInPolygon(pt_sat, box.toPolygon())) {
            this.col = this.p.color(0, 255, 255);
            this.spring_list.map((spring) => spring.select());
            this.select(selected_parts);    
            return true;           
        }
        return false;
    }

    // check collision with mouse or hand input to select
    checkInteractionPt(pt, selected_parts) {
        let selected = 0;
        this.spring_list.map((spring) => {
            if(spring.checkInteractionPt(pt)) {
                spring.select();
                selected = spring;
            }
        });
        if(selected != 0) {
            this.select(selected_parts);
        }
        else {
            this.deselect();
            //setSelectedCount(selected_count() - 1);               
        }
        return selected;
    }

    moveHorizontal(inc_x) {
        if(this.checkBounds()) {
            this.lock()
            this.x += inc_x;
            this.after_move = this.p.createVector(this.x, this.y);
            this.lock()
        }
    }

    calculateChange() {
        const change = p5.Vector.sub(this.after_move, this.before_move).mag();
        return change;
    }

    changeColor(col) {
        this.col = col;
        this.spring_list.map((s) => s.col = col)
    }

    moveVertical(inc_y) {
        if(this.checkBounds()) {
            this.lock()
            this.y += inc_y;
            this.after_move = this.p.createVector(this.x, this.y);
            this.lock()
        }
    }

    select(selected_parts) {
        if(!this.isSelected) {
            this.isSelected = true;
            this.col = this.p.color(0, 0, 255); 
            setSelectedCount(selected_count() + 1);  
            selected_parts.push([this, this.col_area]);
        }
    }

    isolate() {
        this.spring_list.map((s) => {
            if(s.isSelected) 
                s.isolate()
        });
        this.deselect();
        this.isIsolated = true;
    }

    reset() {
        this.spring_list.map((s) => {
            if(s.isIsolated) 
                s.reset()
        });
        this.isIsolated = false;
        this.stroke_col = this.p.color(0, 0, 0);
    }

    deselect() {
        this.isSelected = false;
        if(!this.isIsolated)
        this.spring_list.map((s) => {
            if(!s.isIsolated) 
                s.deselect()
        });
    }

    // add repulsive forces when removed
    remove() {
        if(!!this.ptr_d) {
            this.ptr_d.removeAdj(this);
            this.ptr_d.f.setStrength(-0.5);
            this.ptr_d.f_start = this.p.millis();
            this.physics.addBehavior(this.f);
           // this.physics.addBehavior(new AttractionBehavior(this.ptr_d, 50, this.ptr_d.f, 0));
        }
        if(!!this.ptr_l) {
            this.ptr_l.f.setStrength(-0.5);
            this.ptr_l.f_start = this.p.millis();
            this.physics.addBehavior(this.f);
           // this.physics.addBehavior(new AttractionBehavior(this.ptr_l, 50, this.ptr_l.f, 0));
            this.ptr_l.removeAdj(this);
        }
        if(!!this.ptr_u) {
            this.ptr_u.f.setStrength(-0.5);
            this.ptr_u.f_start = this.p.millis();
            this.physics.addBehavior(this.f);
         //   this.physics.addBehavior(new AttractionBehavior(this.ptr_u, 50, this.ptr_u.f, 0));
            this.ptr_u.removeAdj(this);
        }
        if(!!this.ptr_r) {
            this.ptr_r.f.setStrength(-0.5);
            this.ptr_r.f_start = this.p.millis();
            this.physics.addBehavior(this.f);
          //  this.physics.addBehavior(new AttractionBehavior(this.ptr_r, 50, this.ptr_r.f, 0));
            this.ptr_r.removeAdj(this);
        }
        this.physics.removeParticle(this);
        this.spring_list.map((s) => s.remove());
        this.spring_list = [];
        this.remove_from_grid = true;
    }

    checkBounds() {
        if(this.x >= this.bounds_x_end) {
            this.x -= 5;
            return false;
        } else if (this.x <= this.bounds_x_start) {
            this.x += 5;
            return false;

        }else if (this.y <= this.bounds_y_start) {
            this.y += 5;
            return false;

        } else if (this.y >= this.bounds_y_end) {
            this.y -= 5;
            return false;
        } 
        return true;
    }

    checkCollision(part) {
        let vec = new Vec2D(part.x, part.y);
        if(this.col_area.containsPoint(vec)) {
            this.lockp = true;
        }else {
            this.lockp = false;
        }
    }

    removeAdj(part) {
        if(part == this.ptr_d) {
            this.ptr_d = null;
        }else if(part == this.ptr_l) {
            this.ptr_l =  null;
        }else if(part == this.ptr_r){
            this.ptr_r = null
        }else if(part == this.ptr_u) {
            this.ptr_u = null
        }
    }

    display() {
    //    this.p.stroke(this.stroke_col);
    //    this.p.circle(this.x,this.y,4);
    }

}