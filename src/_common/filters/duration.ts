import humanizeDuration from 'humanize-duration';
import { getCurrentServerTime } from '../../utils/server-time';

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

type ShorthandTimePrecision = 'exact' | 'rough';

interface ShorthandTimeOptions {
	allowFuture?: boolean;
	precision?: ShorthandTimePrecision;
	joiner?: string;
	nowText?: string;
	trailingText?: string;
}

export function shorthandReadableTime(
	date: number,
	{
		allowFuture = false,
		precision = 'exact',
		joiner = ', ',
		nowText = 'now',
		trailingText,
	}: ShorthandTimeOptions = {}
): string {
	const now = getCurrentServerTime();
	let duration = now - date;
	if (allowFuture) {
		duration = Math.abs(duration);
	}

	const seconds = duration / 1000;
	const minutes = seconds / 60;
	const hours = minutes / 60;
	const days = hours / 24;
	const weeks = days / 7;
	const months = days / 30;
	const years = months / 12;

	let data: Record<string, number> = {
		Y: Math.floor(years),
		M: Math.floor(months % 12),
		w: Math.floor(weeks % 7),
		d: Math.floor(days % 7),
		h: Math.floor(hours % 24),
		m: Math.floor(minutes % 60),
		s: Math.floor(seconds % 60),
	};

	switch (precision) {
		case 'exact':
			// Use existing data as-is.
			break;

		case 'rough': {
			const newData: Record<string, number> = {};
			for (const [key, value] of Object.entries(data)) {
				if (value <= 0) {
					continue;
				}
				Object.assign(newData, { [key]: value });
				if (key === 'm' && value < 10) {
					Object.assign(newData, { s: data.s });
				}
				break;
			}

			data = newData;
			break;
		}
	}

	const strings: string[] = [];
	for (const [key, value] of Object.entries(data)) {
		if (value > 0 || (key == 's' && strings.length > 0)) {
			strings.push(`${value}${key}`);
		}
	}

	if (strings.length === 0) {
		return nowText;
	}

	const joinedText = strings.join(joiner);
	if (trailingText) {
		return `${joinedText} ${trailingText}`;
	}
	return joinedText;
}
