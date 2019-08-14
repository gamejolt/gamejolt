export function parse(val: string) {
	const sanitized = val.replace(/[^\d]+/, '');
	const m = parseInt(sanitized.substring(0, 2), 10);

	const ySub = sanitized.substring(2, 4);
	const y = ySub && ySub.length === 2 ? parseInt('20' + sanitized.substring(2, 4), 10) : 0;

	return { m: m, y: y };
}

export function isValid(val: string) {
	const parsed = parse(val);
	return !!parsed.y && parsed.m < 13 && parsed.m > 0;
}
