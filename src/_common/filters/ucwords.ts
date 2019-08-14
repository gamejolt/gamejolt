export function ucwords(str: string) {
	return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, $1 => {
		return $1.toUpperCase();
	});
}
