export function aabb(ap, as, bp, bs) {
  return ap.x < bp.x + bs.x && ap.x + as.x > bp.x && ap.y < bp.y + bs.y && as.y + ap.y > bp.y;
}