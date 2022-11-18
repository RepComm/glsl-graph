import { Object2D, Vec2 } from "@repcomm/scenario2d";
export function diff(a, b) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  return max - min;
}
export class Node extends Object2D {
  get TITLE() {
    return "Node";
  }
  get BG() {
    return "#242424";
  }
  get FG() {
    return "#ffffff";
  }
  constructor() {
    super();
    this.size = new Vec2().set(20, 20);
    this.center = new Vec2().set(10, 10);
    this.padding = 20;
    this.isSelected = false;
  }
  get needsMeasureTitle() {
    return this.titleTextMetrics == undefined || this.titleTextMetrics == null;
  }
  measureTitle(ctx) {
    this.titleTextMetrics = ctx.measureText(this.TITLE);
    this.titleTextMetrics.height = diff(this.titleTextMetrics.actualBoundingBoxAscent, this.titleTextMetrics.actualBoundingBoxDescent);
    this.titleTextMetrics.halfHeight = this.titleTextMetrics.height / 2;
    this.titleTextMetrics.halfWidth = this.titleTextMetrics.width / 2;
  }
  ensureMeasureTitle(ctx) {
    if (this.needsMeasureTitle) {
      this.measureTitle(ctx);
      return true;
    }
    return false;
  }
  renderTitle(ctx) {
    ctx.fillStyle = this.FG;
    ctx.fillText(this.TITLE, this.center.x - this.titleTextMetrics.halfWidth, this.center.y + this.titleTextMetrics.halfHeight);
  }
  onRenderSelf(ctx) {
    if (this.needsMeasureTitle) this.measureTitle(ctx);
    this.size.set(this.titleTextMetrics.width + this.padding * 2, this.titleTextMetrics.height + this.padding * 2);
    this.center.copy(this.size).mulScalar(0.5);
    ctx.fillStyle = this.BG;
    ctx.fillRect(0, 0, this.size.x, this.size.y);
    if (this.isSelected) {
      ctx.strokeStyle = this.FG;
      ctx.strokeRect(0, 0, this.size.x, this.size.y);
    }
    this.renderTitle(ctx);
    return this;
  }
  get left() {
    return this.globalTransform.position.x;
  }
  get right() {
    return this.globalTransform.position.x + this.size.x;
  }
  get top() {
    return this.globalTransform.position.y;
  }
  get bottom() {
    return this.globalTransform.position.y + this.size.y;
  }
  containsPoint(p) {
    return p.x > this.left && p.x < this.right && p.y > this.top && p.y < this.bottom;
  }
}
export class Connection extends Object2D {
  get ix() {
    return this.i.right;
  }
  get iy() {
    return this.i.top;
  }
  get ox() {
    var _this$o;
    return ((_this$o = this.o) === null || _this$o === void 0 ? void 0 : _this$o.left) || this.floatingEndpoint.x;
  }
  get oy() {
    var _this$o2;
    return ((_this$o2 = this.o) === null || _this$o2 === void 0 ? void 0 : _this$o2.top) || this.floatingEndpoint.y;
  }
  constructor() {
    super();
    this.floatingEndpoint = new Vec2();
  }
  onRenderSelf(ctx) {
    var _this$o3;
    let dist = this.ox - this.ix;
    if (dist < 0) dist = 0;
    let ihh = this.i.size.y / 2;
    let ohh = ((_this$o3 = this.o) === null || _this$o3 === void 0 ? void 0 : _this$o3.size.y) / 2 || 0;
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(this.ix, this.iy + ihh);
    ctx.bezierCurveTo(this.ix + dist / 2, this.iy + ihh, this.ox - dist / 2, this.oy + ohh, this.ox, this.oy + ohh);
    ctx.stroke();
    return this;
  }
}