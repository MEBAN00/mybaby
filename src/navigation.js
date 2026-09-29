export function movePage(current, step, total) {
  if (step < 0) return Math.max(0, current - 1)
  return current === total - 1 ? 0 : current + 1
}
