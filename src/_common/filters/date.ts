import { format } from 'date-fns';

// 'medium': Sep 3, 2010 12:05:08 PM
// 'short': 9/3/10 12:05 PM
// 'fullDate': Friday, September 3, 2010
// 'longDate': September 3, 2010
// 'mediumDate': Sep 3, 2010
// 'shortDate': 9/3/10
// 'mediumTime': 12:05:08 PM
// 'shortTime': 12:05 PM

const ShortcutFormats = {
	medium: 'LLL d, yyyy h:mm:ss a',
	short: 'L/d/yy h:mm a',
	fullDate: 'iiii, LLLL d, yyyy',
	longDate: 'LLLL d, yyyy',
	mediumDate: 'LLL d, yyyy',
	shortDate: 'L/d/yy',
	mediumTime: 'h:mm:ss a',
	shortTime: 'h:mm a',
	mediumTimeNoMeridiem: 'h:mm:ss',
	shortTimeNoMeridiem: 'h:mm',
};

export function formatDate(now: Date | number, formatTo = ShortcutFormats.medium) {
	if (formatTo && (ShortcutFormats as any)[formatTo]) {
		formatTo = (ShortcutFormats as any)[formatTo];
	}

	return format(now, formatTo);
}
