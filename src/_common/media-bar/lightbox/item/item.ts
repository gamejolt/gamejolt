import { Subscription } from 'rxjs/Subscription';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../utils/vue';
import AppJolticon from '../../../../vue/components/jolticon/jolticon.vue';
import { AppImgResponsive } from '../../../img/responsive/responsive';
import { Screen } from '../../../screen/screen-service';
import AppSketchfabEmbed from '../../../sketchfab/embed/embed.vue';
import AppVideoEmbed from '../../../video/embed/embed.vue';
import AppMediaBarLightboxTS, { MediaBarLightboxConfig } from '../lightbox';
import AppMediaBarLightbox from '../lightbox.vue';

@Component({
	components: {
		AppJolticon,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppImgResponsive,
	},
})
export default class AppMediaBarLightboxItem extends Vue {
	@Prop(Object) item!: any;
	@Prop(Number) itemIndex!: number;
	@Prop(Number) activeIndex!: number;

	lightbox!: AppMediaBarLightboxTS;

	isActive = false;
	isNext = false;
	isPrev = false;

	maxWidth = 0;
	maxHeight = 0;

	private resize$: Subscription | undefined;

	$refs!: {
		caption: HTMLDivElement;
	};

	mounted() {
		this.lightbox = findRequiredVueParent(this, AppMediaBarLightbox) as AppMediaBarLightboxTS;
		this.calcActive();
		this.calcDimensions();

		this.resize$ = Screen.resizeChanges.subscribe(() => this.calcDimensions());
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	@Watch('activeIndex')
	activeIndexChange() {
		this.calcActive();
	}

	async calcDimensions() {
		await this.$nextTick();

		if (Screen.isXs) {
			return;
		}

		// Very fragile. Kinda lame.
		this.maxWidth = Screen.width - MediaBarLightboxConfig.buttonSize * 2;
		this.maxHeight = Screen.height - MediaBarLightboxConfig.controlsHeight * 2;

		if (this.$refs.caption) {
			this.maxHeight -= this.$refs.caption.offsetHeight;
		}

		if (this.item.media_type === 'image') {
			const dimensions = this.item.media_item.getDimensions(this.maxWidth, this.maxHeight);
			this.maxWidth = dimensions.width;
			this.maxHeight = dimensions.height;
		}
	}

	async calcActive() {
		this.isActive = this.activeIndex === this.itemIndex;
		this.isNext = this.activeIndex + 1 === this.itemIndex;
		this.isPrev = this.activeIndex - 1 === this.itemIndex;

		this.$el.classList.remove('active', 'next', 'prev');

		if (this.isActive) {
			this.$el.classList.add('active');
		} else if (this.isPrev) {
			this.$el.classList.add('prev');
		} else if (this.isNext) {
			this.$el.classList.add('next');
		}

		if (this.isActive || this.isNext || this.isPrev) {
			this.calcDimensions();
		}
	}
}
