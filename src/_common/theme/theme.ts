import Vue, { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { Theme } from './theme.service';

@Component({})
export class AppTheme extends Vue {
	render(h: CreateElement) {
		const theme = Theme.theme;

		const styles = `
			:root {
				--theme-highlight: ${theme.highlight};
				--theme-highlight-fg: ${theme.highlightFg};
				--theme-backlight: ${theme.backlight};
				--theme-notice: ${theme.notice};
				--theme-notice-fg: ${theme.noticeFg};
				--theme-bi-bg: ${theme.backlight};
				--theme-bi-fg: ${theme.highlight};
				--theme-link: ${theme.backlight};
				--dark-theme-link: ${theme.highlight};
				--dark-theme-bi-bg: ${theme.highlight};
				--dark-theme-bi-fg: ${theme.highlightFg};
			}
		`;

		return h('style', {
			domProps: {
				innerHTML: styles,
			},
		});
	}
}
