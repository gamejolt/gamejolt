import { transparentize } from 'polished';
import Vue, { CreateElement } from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Theme } from './theme.model';
import { ThemeState, ThemeStore } from './theme.store';

let inc = 0;

@Component({})
export class AppTheme extends Vue {
	@Prop(Theme)
	theme!: Theme | null;

	@Prop(Boolean)
	forceDark!: boolean;

	@Prop(Boolean)
	forceLight!: boolean;

	@ThemeState
	isDark!: ThemeStore['isDark'];

	@ThemeState('theme')
	storeTheme!: ThemeStore['theme'];

	scopeId = ++inc;

	render(h: CreateElement) {
		const id = 'theme-' + this.scopeId;
		const selector = this.$slots.default ? '#' + id : ':root';
		let styles = '';

		const theme = this.theme || this.storeTheme || new Theme();

		function genVar(varname: string, value: string) {
			return `
				--theme-${varname}: #${value};
				--theme-${varname}-trans: ${transparentize(1, '#' + value)};
			`;
		}

		function genDarkVar(varname: string, value: string) {
			return `
				--dark-theme-${varname}: #${value};
				--dark-theme-${varname}-trans: ${transparentize(1, '#' + value)};
			`;
		}

		function copyVar(varname: string, target: string) {
			return `
				--theme-${varname}: var(--theme-${target});
				--theme-${varname}-trans: var(--theme-${target}-trans);
			`;
		}

		function copyDarkVar(varname: string, target: string) {
			return `
				--dark-theme-${varname}: var(--theme-${target});
				--dark-theme-${varname}-trans: var(--theme-${target}-trans);
			`;
		}

		styles += `
			${selector} {
				${genVar('white', 'fff')}
				${genVar('black', '000')}

				${genVar('darkest', theme.darkest_)}
				${genVar('darker', theme.darker_)}
				${genVar('dark', theme.dark_)}
				${genVar('gray', theme.gray_)}
				${genVar('gray-subtle', theme.graySubtle_)}
				${genVar('light', theme.light_)}
				${genVar('lighter', theme.lighter_)}
				${genVar('lightest', theme.lightest_)}

				${genVar('highlight', theme.highlight_)}
				${genVar('highlight-fg', theme.highlightFg_)}
				${genVar('backlight', theme.backlight_)}
				${genVar('notice', theme.notice_)}
				${genVar('notice-fg', theme.noticeFg_)}
				${genVar('bi-bg', theme.biBg_)}
				${genVar('bi-fg', theme.biFg_)}
				${copyVar('bg', 'white')}
				${copyVar('bg-offset', 'lightest')}
				${genVar('bg-backdrop', theme.bgBackdrop_)}
				${genVar('bg-backdrop-xs', theme.bgBackdropXs_)}
				${copyVar('bg-subtle', 'lighter')}
				${copyVar('fg', 'dark')}
				${copyVar('fg-muted', 'light')}
				${copyVar('link', 'backlight')}
				${copyVar('link-hover', 'black')}

				${genDarkVar('highlight', theme.darkHighlight_)}
				${genDarkVar('backlight', theme.darkBacklight_)}
				${genDarkVar('notice', theme.darkNotice_)}
				${genDarkVar('bi-bg', theme.darkBiBg_)}
				${genDarkVar('bi-fg', theme.darkBiFg_)}
				${copyDarkVar('bg', 'dark')}
				${copyDarkVar('bg-offset', 'darker')}
				${genDarkVar('bg-backdrop', theme.darkBgBackdrop_)}
				${genDarkVar('bg-backdrop-xs', theme.darkBgBackdropXs_)}
				${copyDarkVar('bg-subtle', 'gray-subtle')}
				${copyDarkVar('fg', 'lightest')}
				${copyDarkVar('fg-muted', 'light')}
				${genDarkVar('link', theme.darkHighlight_)}
				${copyDarkVar('link-hover', 'white')}
			}
		`;

		function darkVar(varname: string) {
			return `
				--theme-${varname}: var(--dark-theme-${varname});
				--theme-${varname}-trans: var(--dark-theme-${varname}-trans);
			`;
		}

		if ((this.isDark && !this.forceLight) || this.forceDark) {
			// Sync with the theme-dark() stylus mixin.
			styles += `
				${selector} {
					${darkVar('highlight')}
					${darkVar('backlight')}
					${darkVar('notice')}
					${darkVar('bi-bg')}
					${darkVar('bi-fg')}
					${darkVar('bg')}
					${darkVar('bg-offset')}
					${darkVar('bg-backdrop')}
					${darkVar('bg-backdrop-xs')}
					${darkVar('bg-subtle')}
					${darkVar('fg')}
					${darkVar('fg-muted')}
					${darkVar('link')}
					${darkVar('link-hover')}
				}
			`;
		}

		return h(
			'div',
			{
				domProps: { id: id },
			},
			[h('style', { domProps: { innerHTML: styles } }), this.$slots.default]
		);
	}
}
