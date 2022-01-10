import Axios from 'axios';
import { darken, lighten, parseToHsl } from 'polished';
import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { arrayUnique } from '../../../utils/array';
import { propOptional } from '../../../utils/vue';
import { DefaultTheme, Theme } from '../theme.model';
import { ThemeState, ThemeStore } from '../theme.store';

const SvgGraysRegex = /#([a-f\d]{1,2})\1{2}\b/gi;

@Options({})
export class AppThemeSvg extends Vue {
	@Prop(propOptional(String, '')) src!: string;
	@Prop(propOptional(Theme, null)) theme!: null | Theme;

	/**
	 * Whether or not we should change colors depending on the light/dark mode
	 * chosen to make sure the colors will always show on the background. True
	 * means that we should leave the colors as is, and false means we'll change
	 * depending on mode.
	 */
	@Prop(propOptional(Boolean, false)) strictColors!: boolean;

	@ThemeState('theme') storeTheme!: ThemeStore['theme'];
	@ThemeState isDark!: ThemeStore['isDark'];

	rawSvg = '';
	request?: Promise<any>;

	get actualTheme() {
		return this.theme || this.storeTheme;
	}

	get processedSvg() {
		if (import.meta.env.SSR) {
			return this.src;
		}

		let svgData = this.rawSvg;

		if (this.actualTheme) {
			let highlight = '#' + this.actualTheme.highlight;
			let backlight = '#' + this.actualTheme.backlight;
			let notice = '#' + this.actualTheme.notice;

			if (this.actualTheme.custom) {
				const highlight_ =
					'#' +
					(this.isDark ? this.actualTheme.darkHighlight_ : this.actualTheme.highlight_);
				const hsl = parseToHsl(highlight_);
				if (hsl.lightness < 0.4) {
					highlight = lighten(0.3, highlight_);
					backlight = highlight_;
				} else {
					highlight = highlight_;
					backlight = darken(0.3, highlight_);
				}
				notice = highlight;
			}

			// Process svgData as a String so we don't throw errors in the
			// ThemeSvg styleguide if the custom svg string is a number.
			let grays = String(svgData).match(SvgGraysRegex);

			if (grays) {
				grays = arrayUnique(grays);

				for (const gray of grays) {
					svgData = svgData.replace(gray, '#' + this.actualTheme.tintColor(gray, 0.04));
				}
			}

			// Same as above, need to convert svgData to a string in case
			// the custom svg input from the ThemeSvg styleguide is a number.
			svgData = String(svgData)
				.replace(/#ccff00/gi, highlight)
				.replace(/#cf0/gi, highlight)
				.replace(/#2f7f6f/gi, !this.strictColors && this.isDark ? highlight : backlight)
				.replace(/#ff3fac/gi, notice)
				.replace(/#31d6ff/gi, !this.strictColors && this.isDark ? highlight : backlight);
		} else if (!this.strictColors) {
			// If we have no theme from the prop or the ThemeStore, that means
			// we're using the default theme colors and only need to replace our
			// highlight/backlight colors.
			const { highlight, backlight } = DefaultTheme;

			svgData = String(svgData)
				.replace(/#2f7f6f/gi, this.isDark ? '#' + highlight : '#' + backlight)
				.replace(/#31d6ff/gi, this.isDark ? '#' + highlight : '#' + backlight);
		}

		return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgData);
	}

	@Watch('src', { immediate: true })
	onSrcChange() {
		const request = Axios.get(this.src).then(response => {
			// If we have multiple requests in process, only handle the latest one.
			if (!this.request || this.request !== request) {
				return;
			}

			if (response.status === 200) {
				this.rawSvg = response.data;
			}
		});

		this.request = request;
	}

	render() {
		return h('img', { src: this.processedSvg });
	}
}
