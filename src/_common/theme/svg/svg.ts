import Axios from 'axios';
import { darken, lighten, parseToHsl } from 'polished';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { CreateElement } from 'vue/types/vue';
import { ThemeState, ThemeStore } from '../theme.store';

@Component({})
export class AppThemeSvg extends Vue {
	@Prop(String)
	src!: string;

	@ThemeState
	theme!: ThemeStore['theme'];

	rawSvg = '';
	request?: Promise<any>;

	get processedSvg() {
		if (GJ_IS_SSR) {
			return this.src;
		}

		let svgData = this.rawSvg;

		if (this.theme) {
			let highlight = '#' + this.theme.highlight;
			let backlight = '#' + this.theme.backlight;
			let notice = '#' + this.theme.notice;

			if (this.theme.custom) {
				const highlight_ = '#' + this.theme.highlight_;
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

			svgData = svgData
				.replace(/\#ccff00/gi, highlight)
				.replace(/\#cf0/gi, highlight)
				.replace(/\#2f7f6f/gi, backlight)
				.replace(/\#ff3fac/gi, notice)
				.replace(/\#31d6ff/gi, backlight);
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

	render(h: CreateElement) {
		return h('img', { domProps: { src: this.processedSvg } });
	}
}
