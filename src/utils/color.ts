// Color helpers. Hex parsers accept #rgb and #rrggbb; rgb()/rgba()/hsl()
// string parsing is intentionally not supported. Outputs are always 6-char hex.

export type RgbColor = { r: number; g: number; b: number };
type HslColor = { h: number; s: number; l: number };
type LabColor = { l: number; a: number; b: number };

const _hex2 = (s: string, i: number) => parseInt(s[i] + s[i + 1], 16);
const _hex1 = (s: string, i: number) => parseInt(s[i] + s[i], 16);

function _toHex(value: number) {
	const h = value.toString(16);
	return h.length === 1 ? '0' + h : h;
}

function _clamp01(n: number) {
	return n < 0 ? 0 : n > 1 ? 1 : n;
}

export function parseToRgb(color: string): RgbColor {
	if (/^#[a-fA-F0-9]{6}$/.test(color)) {
		return { r: _hex2(color, 1), g: _hex2(color, 3), b: _hex2(color, 5) };
	}
	if (/^#[a-fA-F0-9]{3}$/.test(color)) {
		return { r: _hex1(color, 1), g: _hex1(color, 2), b: _hex1(color, 3) };
	}
	throw new Error(`parseToRgb: unsupported color "${color}"`);
}

export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	if (max === min) {
		return { h: 0, s: 0, l };
	}
	const delta = max - min;
	const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
	let h: number;
	if (max === rn) {
		h = (gn - bn) / delta + (gn < bn ? 6 : 0);
	} else if (max === gn) {
		h = (bn - rn) / delta + 2;
	} else {
		h = (rn - gn) / delta + 4;
	}
	return { h: h * 60, s, l };
}

export function parseToHsl(color: string): HslColor {
	return rgbToHsl(parseToRgb(color));
}

export function rgb({ r, g, b }: RgbColor): string {
	return '#' + _toHex(r) + _toHex(g) + _toHex(b);
}

export function hsl(h: number, s: number, l: number): string {
	if (s === 0) {
		const v = Math.round(l * 255);
		return '#' + _toHex(v) + _toHex(v) + _toHex(v);
	}
	// https://en.wikipedia.org/wiki/HSL_and_HSV
	const huePrime = (((h % 360) + 360) % 360) / 60;
	const chroma = (1 - Math.abs(2 * l - 1)) * s;
	const second = chroma * (1 - Math.abs((huePrime % 2) - 1));
	let r = 0,
		g = 0,
		b = 0;
	if (huePrime < 1) [r, g] = [chroma, second];
	else if (huePrime < 2) [r, g] = [second, chroma];
	else if (huePrime < 3) [g, b] = [chroma, second];
	else if (huePrime < 4) [g, b] = [second, chroma];
	else if (huePrime < 5) [r, b] = [second, chroma];
	else [r, b] = [chroma, second];
	const m = l - chroma / 2;
	return rgb({
		r: Math.round((r + m) * 255),
		g: Math.round((g + m) * 255),
		b: Math.round((b + m) * 255),
	});
}

export function complement(color: string): string {
	const { h, s, l } = parseToHsl(color);
	return hsl((h + 180) % 360, s, l);
}

export function desaturate(amount: number, color: string): string {
	const c = parseToHsl(color);
	return hsl(c.h, _clamp01(c.s - amount), c.l);
}

export function darken(amount: number, color: string): string {
	const c = parseToHsl(color);
	return hsl(c.h, c.s, _clamp01(c.l - amount));
}

export function lighten(amount: number, color: string): string {
	const c = parseToHsl(color);
	return hsl(c.h, c.s, _clamp01(c.l + amount));
}

export function mix(weight: number, color1: string, color2: string): string {
	const c1 = parseToRgb(color1);
	const c2 = parseToRgb(color2);
	return rgb({
		r: Math.floor(c1.r * weight + c2.r * (1 - weight)),
		g: Math.floor(c1.g * weight + c2.g * (1 - weight)),
		b: Math.floor(c1.b * weight + c2.b * (1 - weight)),
	});
}

function _luminance(color: string): number {
	const { r, g, b } = parseToRgb(color);
	const channel = (n: number) => {
		const v = n / 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * Returns '#000' or '#fff' depending on which gives better contrast against
 * `color`. Threshold matches polished's readableColor (luminance > 0.179).
 */
export function readableColor(color: string): string {
	return _luminance(color) > 0.179 ? '#000' : '#fff';
}

// the following functions are based off of the pseudocode
// found on www.easyrgb.com

export function labToRgb(lab: LabColor): RgbColor {
	let y = (lab.l + 16) / 116,
		x = lab.a / 500 + y,
		z = y - lab.b / 200,
		r,
		g,
		b;

	x = 0.95047 * (x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787);
	y = 1.0 * (y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787);
	z = 1.08883 * (z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787);

	r = x * 3.2406 + y * -1.5372 + z * -0.4986;
	g = x * -0.9689 + y * 1.8758 + z * 0.0415;
	b = x * 0.0557 + y * -0.204 + z * 1.057;

	r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
	g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
	b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

	return {
		r: Math.floor(Math.max(0, Math.min(1, r)) * 255),
		g: Math.floor(Math.max(0, Math.min(1, g)) * 255),
		b: Math.floor(Math.max(0, Math.min(1, b)) * 255),
	};
}

export function rgbToLab({ r, g, b }: RgbColor): LabColor {
	let rn = r / 255,
		gn = g / 255,
		bn = b / 255,
		x,
		y,
		z;

	rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
	gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
	bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

	x = (rn * 0.4124 + gn * 0.3576 + bn * 0.1805) / 0.95047;
	y = (rn * 0.2126 + gn * 0.7152 + bn * 0.0722) / 1.0;
	z = (rn * 0.0193 + gn * 0.1192 + bn * 0.9505) / 1.08883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

	return { l: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}
