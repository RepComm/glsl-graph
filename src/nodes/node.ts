import { Object2D, Vec2 } from "@repcomm/scenario2d";

export interface NodeConfig {
  tooltip: string;
}

export interface ExtendedTextMetrics extends TextMetrics {
  height: number;
  halfWidth: number;
  halfHeight: number;
}

export function diff (a: number, b: number) {
  let min = Math.min(a, b);
  let max = Math.max(a, b);
  return max - min;
}

export class Node extends Object2D {
  get TITLE(): string {
    return "Node";
  }
  get BG(): string {
    return "#242424";
  }
  get FG (): string {
    return "#ffffff";
  }

  isSelected: boolean;

  titleTextMetrics: ExtendedTextMetrics;

  padding: number;

  size: Vec2;
  center: Vec2;

  constructor () {
    super();
    this.size = new Vec2().set(20, 20);
    this.center = new Vec2().set(10,10);
    this.padding = 20;
    this.isSelected = false;
  }
  
  get needsMeasureTitle (): boolean {
    return this.titleTextMetrics == undefined || this.titleTextMetrics == null;
  }

  measureTitle (ctx: CanvasRenderingContext2D) {
    this.titleTextMetrics = ctx.measureText(this.TITLE) as ExtendedTextMetrics;
    this.titleTextMetrics.height = diff(
      this.titleTextMetrics.actualBoundingBoxAscent,
      this.titleTextMetrics.actualBoundingBoxDescent
    );
    this.titleTextMetrics.halfHeight = this.titleTextMetrics.height/2;
    this.titleTextMetrics.halfWidth = this.titleTextMetrics.width/2;
  }

  ensureMeasureTitle (ctx: CanvasRenderingContext2D): boolean {
    if (this.needsMeasureTitle) {this.measureTitle(ctx); return true; }
    return false;
  }

  renderTitle (ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.FG;
    ctx.fillText(
      this.TITLE,
      this.center.x -this.titleTextMetrics.halfWidth,
      this.center.y + this.titleTextMetrics.halfHeight
    );
  }

  onRenderSelf(ctx: CanvasRenderingContext2D): this {
    if (this.needsMeasureTitle) this.measureTitle(ctx);

    this.size.set(
      this.titleTextMetrics.width + this.padding*2, this.titleTextMetrics.height + this.padding*2
    );
    this.center.copy(this.size).mulScalar(0.5);

    ctx.fillStyle = this.BG;
    ctx.fillRect(0, 0, this.size.x, this.size.y);

    if (this.isSelected) {
      ctx.strokeStyle = this.FG;
      ctx.strokeRect(0,0,this.size.x, this.size.y);
    }

    this.renderTitle(ctx);
    return this;
  }

  get left (): number {
    return this.globalTransform.position.x;
  }
  get right (): number {
    return this.globalTransform.position.x + this.size.x;
  }
  get top (): number {
    return this.globalTransform.position.y;
  }
  get bottom (): number {
    return this.globalTransform.position.y + this.size.y;
  }

  containsPoint (p: Vec2): boolean {
    return (
      p.x > this.left && p.x < this.right &&
      p.y > this.top && p.y < this.bottom
    );
  }
}

export class Connection extends Object2D {
  i: Node;
  o: Node;

  floatingEndpoint: Vec2;

  get ix (): number {
    return this.i.right;
  }
  get iy (): number {
    return this.i.top;
  }
  get ox (): number {
    return this.o?.left || this.floatingEndpoint.x;
  }
  get oy (): number {
    return this.o?.top || this.floatingEndpoint.y;
  }

  constructor () {
    super();
    this.floatingEndpoint = new Vec2();
  }

  onRenderSelf(ctx: CanvasRenderingContext2D): this {
    let dist = this.ox - this.ix;
    if (dist < 0) dist = 0;

    let ihh = this.i.size.y/2;
    let ohh = this.o?.size.y/2||0;

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(this.ix, this.iy + ihh);

    ctx.bezierCurveTo(
      this.ix + dist/2, 
      this.iy + ihh,
      this.ox - dist/2,
      this.oy + ohh,
      this.ox, this.oy + ohh
    );
    ctx.stroke();

    return this;
  }
}
