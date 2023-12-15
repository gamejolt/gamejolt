/** Helper for wrapping a value in `Math.max` and `Math.min` calls. */
export function clampNumber(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}
