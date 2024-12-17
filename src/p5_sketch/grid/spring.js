import {VerletConstrainedSpring2D } from "toxiclibsjs/physics2d.js";
import SAT from "sat";

export default class Spring extends VerletConstrainedSpring2D {
    constructor(p, a, b, len, str, brush, springs) {
        super(a, b, len, str);
        this.p = p;
        this.col = this.p.color(255, 255, 255);
        this.isSelected = false;
        this.isIsolated = false;
        this.physics = window.physics;
        this.brush = brush;
        this.springs = springs;
    } 

    update_spring() {
       if(this.a.isSelected && this.b.isSelected) {
        this.select();
       }
       this.display();
    }

    select() {
        this.isSelected = true;
        this.col = this.p.color(128, 0, 32); 
    }

    deselect() {
        this.isSelected = false;
       if(!this.isIsolated) {
        this.col = this.p.color(255, 255, 255); 
       }
    }

    isolate() {
        this.isIsolated = true;
        this.deselect();
    }

    reset() {
        this.isIsolated = false;
        this.col = this.p.color(255, 255, 255);
    }

    checkInteractionPt(pt) {
        let box = new SAT.Box(new SAT.Vector(this.a.x, this.a.y), this.b.x - this.a.x + 20, this.b.y - this.a.y + 20);
        let pt_sat = new SAT.Vector(pt.x, pt.y)
        if(SAT.pointInPolygon(pt_sat, box.toPolygon())) {
            this.select();
            return true;
        }
        else {
            this.deselect();
            return false;
        }
    }

    remove() {
        this.a.spring_list = this.a.spring_list.filter((s) => s != this);
        this.b.spring_list = this.b.spring_list.filter((s) => s != this);
        const i = this.springs.indexOf(this);
        this.springs.splice(i, 1)
        this.physics.removeSpring(this);
    }

    display() {
       /* this.p.strokeWeight(1);
        this.brush.fill("blue", 60);
        this.brush.stroke(this.col);
        this.brush.line(this.a.x, this.a.y, this.b.x, this.b.y);  */      
    }
}