import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { EventSubscription } from '../../system/event/event-topic';
import { Analytics } from '../analytics/analytics.service';
import { EscapeStack } from '../escape-stack/escape-stack.service';
import { MediaItem } from '../media-item/media-item-model';
import { Screen } from '../screen/screen-service';
import AppShortkey from '../shortkey/shortkey.vue';
import AppLightboxItem from './item/item.vue';
import './lightbox-global.styl';
import AppLightboxSlider from './slider.vue';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

export const LightboxConfig = {
	// This should match the $-controls-height variable in lightbox.styl
	controlsHeight: 80,

	// This should match the $-button-size variable in lightbox.styl + some extra padding.
	buttonSize: 110,
};

export interface LightboxMediaSource {
	goNext(): void;
	goPrev(): void;
	clearActiveItem(): void;
	getActiveIndex(): number;
	getActiveItem(): LightboxMediaModel;
	getItemCount(): number;
	getItems(): LightboxMediaModel[];
}

export type LightboxMediaType = 'image' | 'video' | 'sketchfab';

export interface LightboxMediaModel {
	getModelId(): number;
	getMediaType(): LightboxMediaType;

	// Screenshot/Media Item
	getMediaItem(): MediaItem | undefined;
}

@Component({
	components: {
		AppLightboxSlider,
		AppLightboxItem,
		AppShortkey,
	},
})
export default class AppLightbox extends Vue {
	@Prop(Object)
	mediaBar!: LightboxMediaSource;

	sliderElem?: HTMLElement;
	currentSliderOffset = 0;
	isDragging = false;
	waitingForFrame = false;

	private resize$?: EventSubscription;
	private escapeCallback?: Function;

	mounted() {
		document.body.classList.add('media-bar-lightbox-open');

		this.resize$ = Screen.resizeChanges.subscribe(() => {
			this.refreshSliderPosition();
		});

		this.escapeCallback = () => this.close();
		EscapeStack.register(this.escapeCallback);
	}

	destroyed() {
		document.body.classList.remove('media-bar-lightbox-open');

		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}

		if (this.escapeCallback) {
			EscapeStack.deregister(this.escapeCallback);
			this.escapeCallback = undefined;
		}
	}

	setSlider(slider: HTMLElement) {
		this.sliderElem = slider;
		this.refreshSliderPosition();
	}

	goNext() {
		this.mediaBar.goNext();
		this.refreshSliderPosition();
	}

	goPrev() {
		this.mediaBar.goPrev();
		this.refreshSliderPosition();
	}

	close() {
		this.mediaBar.clearActiveItem();
	}

	refreshSliderPosition() {
		const newOffset = -(Screen.width * this.mediaBar.getActiveIndex());
		if (this.sliderElem) {
			this.sliderElem.style.transform = `translate3d( ${newOffset}px, 0, 0 )`;
		}
		this.currentSliderOffset = newOffset;
	}

	panStart() {
		this.isDragging = true;
		this.$el.classList.add('dragging');
	}

	pan(event: HammerInput) {
		if (!this.waitingForFrame) {
			this.waitingForFrame = true;
			window.requestAnimationFrame(() => this.panTick(event));
		}
	}

	panTick(event: HammerInput) {
		this.waitingForFrame = false;

		// In case the animation frame was retrieved after we stopped dragging.
		if (!this.isDragging) {
			return;
		}

		if (!this.sliderElem) {
			return;
		}

		this.sliderElem.style.transform = `translate3d( ${this.currentSliderOffset +
			event.deltaX}px, 0, 0 )`;
	}

	panEnd(event: HammerInput) {
		this.isDragging = false;

		this.$el.classList.remove('dragging');

		// Make sure we moved at a high enough velocity and distance to register the "swipe".
		const velocity = event.velocityX;
		if (Math.abs(velocity) > 0.65 && event.distance > 10) {
			if (velocity < 0) {
				this.goNext();
				Analytics.trackEvent('media-bar', 'swiped-next');
			} else {
				this.goPrev();
				Analytics.trackEvent('media-bar', 'swiped-prev');
			}
			return;
		}

		// We don't change the active item and instead just refresh the slider position.
		// This should reset the position after us moving it in drag().
		this.refreshSliderPosition();
	}
}
