import Vue, { CreateElement } from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Screen } from '../../screen/screen-service';
import { Ruler } from '../../ruler/ruler-service';
import { ImgHelper } from '../helper/helper-service';

const WIDTH_HEIGHT_REGEX = /\/(\d+)x(\d+)\//;
const WIDTH_REGEX = /\/(\d+)\//;

@Component({})
export class AppImgResponsive extends Vue {
	@Prop(String) src!: string;

	private initialized = false;
	private processedSrc = '';
	private resize$: Subscription | undefined;

	created() {
		this.processedSrc = this.src;
	}

	async mounted() {
		this.resize$ = Screen.resizeChanges.subscribe(() => this.updateSrc());

		// Make sure the view is compiled.
		await this.$nextTick();
		this.updateSrc();
	}

	render(h: CreateElement) {
		return h('img', {
			staticClass: 'img-responsive',
			domProps: {
				src: this.processedSrc,
			},
		});
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	@Watch('src')
	srcWatch() {
		this.updateSrc();
	}

	private async updateSrc() {
		const containerWidth = Ruler.width(this.$el.parentNode as HTMLElement);

		// Make sure we never do a 0 width, just in case.
		// Seems to happen in some situations.
		if (containerWidth <= 0) {
			return;
		}

		// Update width in the URL.
		// We keep width within 100px increment bounds.
		let newSrc = this.src;
		let mediaserverWidth = containerWidth;
		if (Screen.isHiDpi) {
			// For high dpi, double the width.
			mediaserverWidth = mediaserverWidth * 2;
			mediaserverWidth = Math.ceil(mediaserverWidth / 100) * 100;
		} else {
			mediaserverWidth = Math.ceil(mediaserverWidth / 100) * 100;
		}

		if (newSrc.search(WIDTH_HEIGHT_REGEX) !== -1) {
			newSrc = newSrc.replace(WIDTH_HEIGHT_REGEX, '/' + mediaserverWidth + 'x2000/');
		} else {
			newSrc = newSrc.replace(WIDTH_REGEX, '/' + mediaserverWidth + '/');
		}

		// Only if the src changed from previous runs.
		// They may be the same if the user resized the window but image container didn't change dimensions.
		if (!this.initialized || newSrc !== this.processedSrc) {
			this.processedSrc = newSrc;
			this.initialized = true;

			// Keep the isLoaded state up to date?
			this.$emit('imgloadchange', false);
			await ImgHelper.loaded(newSrc);
			this.$emit('imgloadchange', true);
		}
	}
}
