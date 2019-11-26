
export function map (num, in_min, in_max, out_min, out_max, limit = false) {
  const val = (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  if (limit) {
    const limitMin = Math.min(out_max, out_min)
    const limitMax = Math.max(out_max, out_min)
    return Math.max(limitMin, Math.min(limitMax, val))
  }
  return val
}
