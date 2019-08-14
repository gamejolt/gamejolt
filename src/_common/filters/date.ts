import * as format from 'date-fns/format';

// 'medium': Sep 3, 2010 12:05:08 PM
// 'short': 9/3/10 12:05 PM
// 'fullDate': Friday, September 3, 2010
// 'longDate': September 3, 2010
// 'mediumDate': Sep 3, 2010
// 'shortDate': 9/3/10
// 'mediumTime': 12:05:08 PM
// 'shortTime': 12:05 PM

const ShortcutFormats = {
	medium: 'MMM D, YYYY h:mm:ss A',
	short: 'M/D/YY h:mm A',
	fullDate: 'dddd, MMMM D, YYYY',
	longDate: 'MMMM D, YYYY',
	mediumDate: 'MMM D, YYYY',
	shortDate: 'M/D/YY',
	mediumTime: 'h:mm:ss A',
	shortTime: 'h:mm A',
};

export function date(now: Date | string | number, formatTo?: string) {
	if (formatTo && (ShortcutFormats as any)[formatTo]) {
		formatTo = (ShortcutFormats as any)[formatTo];
	}

	return format(now, formatTo);
}
