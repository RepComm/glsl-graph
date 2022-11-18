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