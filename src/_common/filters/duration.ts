import humanizeDuration from 'humanize-duration';

const humanizer = humanizeDuration.humanizer({
	language: 'shortEn',
	languages: {
		shortEn: {
			y: () => 'y',
			mo: () => 'mo',
			w: () => 'w',
			d: () => 'd',
			h: () => 'h',
			m: () => 'm',
			s: () => 's',
			ms: () => 'ms',
		},
	},
});

export function formatDuration(time: number, language = 'shortEn'): string {
	if (typeof time !== 'undefined') {
		const timeS = time * 1000;
		if (language === 'shortEn') {
			return humanizer(timeS, {
				delimiter: ', ',
				spacer: '',
				units: ['d', 'h', 'm', 's'],
				round: true,
			});
		} else {
			return humanizer(timeS, {
				language,
				units: ['d', 'h', 'm', 's'],
				round: true,
			});
		}
	} else {
		return '';
	}
}
