import Particle from "./particle.js";
import Spring from "./spring.js";
import Grid from "./grid.js";
import Canvas from "./canvas.js"


export default class Factory {
    constructor(p, w_seg_count, h_seg_count, seg_len, handdetect, brush, gl, vertices, grid) {
        this.p = p;
        this.w_seg_count = w_seg_count;
        this.h_seg_count = h_seg_count;
        this.seg_len = seg_len;
        this.physics = window.physics;
        this.handdetect = handdetect;
        this.brush = brush;
        this.gl = gl;
        this.springs_pos = [];
        this.springs = [];
        this.vertices = vertices;
        this.grid = grid;
    }

    createParticles(part_array) {
        for(let w = 0; w < this.w_seg_count; w++) {
            part_array[w] = [];
            for(let h = 0; h < this.h_seg_count; h++) {
                let particle = new Particle(this.p, w * this.seg_len, h * this.seg_len, this.brush);
                this.physics.addParticle(particle);
                if(w == 0  ||  w == this.w_seg_count - 1 || h == 0 || h == this.h_seg_count - 1) {
                    particle.lock();
                }
                part_array[w][h] = particle;
            }
        }
        return part_array;
    }

    createSprings(part_array) {
        for(let w = 0; w < part_array.length; w++) {
            for(let h = 0; h < part_array[w].length; h++) {
                if(w != part_array.length - 1) {
                    const spring_r = new Spring(this.p, part_array[w][h], part_array[w+1][h], this.seg_len, 0.5, this.brush, this.springs);
                    this.physics.addSpring(spring_r);
                    part_array[w][h].spring_list.push(spring_r);
                    part_array[w][h].ptr_r = part_array[w+1][h];
                    this.springs.push(spring_r);
                    this.springs_pos.push([part_array[w][h].x, part_array[w][h].y, part_array[w+1][h].x, part_array[w+1][h].y])
                }
                if(h != part_array[w].length - 1) {
                    const spring_d = new Spring(this.p, part_array[w][h], part_array[w][h+1], this.seg_len, 0.5, this.brush, this.springs);
                    this.physics.addSpring(spring_d);
                    part_array[w][h].spring_list.push(spring_d);
                    part_array[w][h].ptr_d = part_array[w][h + 1];
                    this.springs.push(spring_d);
                    this.springs_pos.push([part_array[w][h].x, part_array[w][h].y, part_array[w][h+1].x, part_array[w][h+1].y])
                }
                if(w != 0) {
                    const spring_l = part_array[w-1][h].spring_list[0];
                    part_array[w][h].spring_list.push(spring_l);
                    part_array[w][h].ptr_l = part_array[w-1][h];
                }
                if(h != 0) {
                    const spring_u = part_array[w][h-1].spring_list[1];
                    part_array[w][h].spring_list.push(spring_u);
                    part_array[w][h].ptr_u = part_array[w][h-1];
                }
            }
        }
    }

    createCanvas(inter) {
        this.grid = new Grid(this.p, inter, this);
        this.grid.part_array = this.createParticles([]);
        this.createSprings(this.grid.part_array);
        this.springs_pos.forEach(([x1,y1,x2,y2]) => {
            this.vertices.push(this.toWebGLCoords(x1, y1),
            this.toWebGLCoords(x2, y2));
        });
        this.vertices = this.vertices.flat();
        let canv = new Canvas(this.p, this.grid, this.gl, this.vertices);
        console.log(this.vertices);
        console.log(this.springs);
        return canv;
    }

    // has bugs with pointers
    duplicate(spring, part_array, type, x, y) {
        const new_a = new Particle(this.p, spring.a.x, spring.a.y);
        const new_b = new Particle(this.p, spring.b.x, spring.b.y);
        switch (type) {
            case 'up':
                new_a.ptr_d = spring.a;
                new_b.ptr_d =  spring.b;
                new_a.ptr_r = new_b;
                spring.a.ptr_u = new_a;
                spring.b.ptr_u = new_b;
                part_array[x].splice(y - 1, 0, new_a);
                part_array[x + 1].splice(y - 1, 0, new_b);
                break;
            case 'down':
                new_a.ptr_u = spring.a;
                new_b.ptr_u =  spring.b;
                new_a.ptr_r = new_b;
                spring.a.ptr_d = new_a;
                spring.b.ptr_d = new_b;
                part_array[x].splice(y + 1, 0, new_a);
                part_array[x + 1].splice(y + 1, 0, new_b);
                break;
            case 'right': 
                new_a.ptr_l = spring.a;
                new_b.ptr_l =  spring.b;
                new_a.ptr_u = new_b;
                spring.a.ptr_r = new_a;
                spring.b.ptr_r = new_b;
                if(!!part_array[x+1]) {
                    part_array[x + 1].splice(y, 0, new_a);
                    part_array[x + 1].splice(y - 1, 0, new_b);
                }
                break;
            case 'left':
                new_a.ptr_r = spring.a;
                new_b.ptr_r =  spring.b;
                new_a.ptr_u = new_b;
                spring.a.ptr_l = new_a;
                spring.b.ptr_l = new_b;
                if(!!part_array[x-1]) {
                    part_array[x - 1].splice(y, 0, new_a);
                    part_array[x - 1].splice(y - 1, 0, new_b);
                }
                break;
        }
        this.physics.addParticle(new_a);
        this.physics.addParticle(new_b);
        const new_spring = new Spring(this.p, new_a, new_b, this.seg_len, 0.5);
        const new_spring_a = new Spring(this.p, spring.a, new_a, this.seg_len, 0.5);
        const new_spring_b = new Spring(this.p, spring.b, new_b, this.seg_len, 0.5);
        new_spring.col = this.p.color(255, 0,0)
        this.physics.addSpring(new_spring);
        this.physics.addSpring(new_spring_a);
        this.physics.addSpring(new_spring_b);

        new_a.spring_list.push(new_spring);
        new_a.spring_list.push(new_spring_a);
        new_b.spring_list.push(new_spring);
        new_b.spring_list.push(new_spring_b);
        spring.a.spring_list.push(new_spring_a);
        spring.b.spring_list.push(new_spring_b);

        if(spring.a.ptr_r === spring.b || spring.a.ptr_l === spring.b) {
            new_a.duplicate_x = true;
            new_b.duplicate_x = true;
        }
        else {
            new_a.duplicate_y = true;
            new_b.duplicate_y = true;
        }
        console.log(this.vertices);
        console.log(this.springs);
    }

    toWebGLCoords(x, y) {
        const webGLX = (x / this.p.width) * 2 - 1; // Normalize X to [-1, 1]
        const webGLY = -((y / this.p.height) * 2 - 1); // Normalize Y to [-1, 1] and flip Y-axis
        return [webGLX, webGLY, 1.0, 0.0, 0.0];
    }
}