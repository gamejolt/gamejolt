const humanizeDuration = require('humanize-duration');

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

export function duration(time: number): string {
	if (typeof time !== 'undefined') {
		return humanizer(time * 1000, {
			delimiter: ', ',
			spacer: '',
			units: ['d', 'h', 'm', 's'],
			round: true,
		});
	} else {
		return '';
	}
}
