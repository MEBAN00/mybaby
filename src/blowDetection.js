export function isBlowing(frequencies, threshold = 40) {
  if (!frequencies.length) return false
  return frequencies.reduce((sum, value) => sum + value, 0) / frequencies.length > threshold
}
