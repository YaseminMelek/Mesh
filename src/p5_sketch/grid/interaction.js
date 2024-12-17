import p5 from 'p5';
import { push_signal, setPush, select_signal, setOpSignal, move_x_signal, move_y_signal,setMoveXSignal, setMoveYSignal, setDupSignal} from "../observer_signal";
export default class Interaction {
    constructor(p) {
        this.press_ctrl = false;
        this.p = p;

        this.selectArea = false;
        this.selectLines = false;
        this.select = false;

        this.area = [];
        this.interPt = [];

        this.closest_start_dist = 10000;
        this.closest_end_dist = 10000;
        this.closest_start_index_x = 10000;
        this.closest_start_index_y = 10000;
        this.closest_end_index_x = 10000;
        this.closest_end_index_y = 10000;
    }
    // based on signals and user input handle interactions
    update() {  
        if(this.selectArea) {
          //  this.area = this.draw_isolation_rect();
        }
        if(select_signal() === 1 && this.p.mouseIsPressed) {
           /* if(!this.selectArea) {
                this.interPt = this.p.createVector(this.p.mouseX, this.p.mouseY);
            }
            this.selectArea = true;*/
        }
        else if(select_signal() === 1 && this.press_ctrl) {
            this.selectLines = true;
            this.interPt = this.p.createVector(this.p.mouseX, this.p.mouseY);
        }
        else if(select_signal() === 1  && !this.selectArea && !this.selectLines) {
            this.select = true;
            this.interPt = this.p.createVector(this.p.mouseX, this.p.mouseY);
        }
        else if((move_x_signal() === 1 || move_y_signal() === 1) && (this.p.mouseIsPressed || push_signal() === 1)) {
            setMoveXSignal(0);
            setMoveYSignal(0);
        }
        else {
            this.select = false;
            this.selectArea = false;
            this.selectLines = false;
        }
    }
    // for select or isolation area
    draw_isolation_rect() {
        this.p.strokeWeight(2);
        this.p.noFill();
        this.p.stroke(0, 255, 255);
        let end_pt = this.p.createVector(this.p.mouseX, this.p.mouseY);
        let dist = p5.Vector.sub(this.p.createVector(this.p.mouseX, this.p.mouseY), this.interPt);
        this.p.rect(this.interPt.x, this.interPt.y, dist.x, dist.y);
        return [this.interPt, dist, end_pt];
    }

    keyReleased(key) {
        this.press_ctrl = false;
    }

    keyPressed(key) {
        if(key === this.p.CONTROL) {
            this.press_ctrl = true;
        }
        // duplicate is not working correctly so it's not on the controls interface. can be triggered with shortcut 3
        if(key === 51) {
            setDupSignal(1);
            setOpSignal('duplicate');
        }
    }
}