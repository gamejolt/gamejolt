import { readableColor } from 'polished';

export class ThemeModel {
	constructor(
		public highlight = '#ccff00',
		public backlight = '#2f7f6f',
		public notice = '#ff3fac'
	) {}

	get highlightFg() {
		return readableColor(this.highlight);
	}

	get noticeFg() {
		return readableColor(this.notice);
	}
}
