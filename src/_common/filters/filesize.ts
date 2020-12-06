const Units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function filesize(bytes: number | string, precision = 0) {
	if (typeof bytes === 'string') {
		bytes = parseInt(bytes, 10);
	}

	if (!isFinite(bytes)) {
		return '?';
	} else if (bytes < 1024) {
		return bytes + ' ' + Units[0];
	}

	let unit = 0;
	while (bytes >= 1024) {
		bytes /= 1024;
		++unit;
	}

	return bytes.toFixed(precision) + ' ' + Units[unit];
}
