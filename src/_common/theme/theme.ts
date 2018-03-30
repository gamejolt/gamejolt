import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { readableColor } from 'polished';

@Component({})
export class AppTheme extends Vue {
	notice = '#ff5a00';
	highlight = '#86a2d6';
	backlight = '#2d3447';

	render(h: CreateElement) {
		const highlightFg = readableColor(this.highlight);
		const noticeFg = readableColor(this.notice);

		const styles = `
			:root {
				--theme-highlight: ${this.highlight};
				--theme-highlight-fg: ${highlightFg};
				--theme-backlight: ${this.backlight};
				--theme-notice: ${this.notice};
				--theme-notice-fg: ${noticeFg};
				--theme-bi-bg: ${this.backlight};
				--theme-bi-fg: ${this.highlight};
				--theme-link: ${this.backlight};
				--dark-theme-link: ${this.highlight};
				--dark-theme-bi-bg: ${this.highlight};
				--dark-theme-bi-fg: ${highlightFg};
			}
		`;

		return h('style', {
			domProps: {
				innerHTML: styles,
			},
		});
	}
}
