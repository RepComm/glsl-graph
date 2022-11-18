import { Vec2 } from "@repcomm/scenario2d";

export function aabb (ap: Vec2, as: Vec2, bp: Vec2, bs: Vec2) {
  return (
    ap.x < bp.x + bs.x &&
    ap.x + as.x > bp.x &&
    ap.y < bp.y + bs.y &&
    as.y + ap.y > bp.y
  );
}
