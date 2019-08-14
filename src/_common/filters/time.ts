export function time(time?: number) {
	if (typeof time !== 'undefined') {
		// Because I'm too stupid to write unit tests.
		// time = 8.456456;  // Should be 0:08
		// time = 18.456456;  // Should be 0:18
		// time = 78.4654;  // Should be 1:18
		// time = 1078.4654;  // Should be 17:58

		const minutes = Math.floor(time / 60);

		const seconds = Math.floor(time % 60);
		let secondsFormatted = '' + seconds;
		if (seconds < 10) {
			secondsFormatted = '0' + seconds;
		}

		return minutes + ':' + secondsFormatted;
	}

	return '-';
}
