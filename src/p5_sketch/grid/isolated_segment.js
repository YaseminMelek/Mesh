export default class IsolatedSegment {
    constructor(p, start_pt, end_pt, color, start_x, end_x, start_y, end_y) {
        this.p = p;
        this.col = color;
        this.start_pt = start_pt;
        this.end_pt = end_pt;
        this.partlist = [];
        this.start_x = start_x;
        this.end_x = end_x;
        this.start_y = start_y;
        this.end_y = end_y;
    }
}