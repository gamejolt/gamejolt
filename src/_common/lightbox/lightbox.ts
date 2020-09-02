import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { EventSubscription } from '../../system/event/event-topic';
import { Analytics } from '../analytics/analytics.service';
import { EscapeStack, EscapeStackCallback } from '../escape-stack/escape-stack.service';
import { Screen } from '../screen/screen-service';
import AppShortkey from '../shortkey/shortkey.vue';
import AppLightboxItem from './item/item.vue';
import { LightboxMediaSource } from './lightbox-helpers';
import AppLightboxSlider from './slider.vue';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
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
	mediaSource!: LightboxMediaSource;

	sliderElem?: HTMLElement;
	currentSliderOffset = 0;
	isDragging = false;
	waitingForFrame = false;

	private resize$?: EventSubscription;
	private escapeCallback?: EscapeStackCallback;

	get items() {
		return this.mediaSource.getItems();
	}

	get activeIndex() {
		return this.mediaSource.getActiveIndex();
	}

	get hasNext() {
		return this.activeIndex < this.mediaSource.getItemCount() - 1;
	}

	get activeMediaItem() {
		return this.mediaSource.getActiveItem().getMediaItem()!;
	}

	get activeMediaType() {
		return this.mediaSource.getActiveItem().getMediaType();
	}

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
		this.mediaSource.goNext();
		this.refreshSliderPosition();
	}

	goPrev() {
		this.mediaSource.goPrev();
		this.refreshSliderPosition();
	}

	close() {
		if (this.mediaSource.onLightboxClose) {
			this.mediaSource.onLightboxClose();
		}

		this.$destroy();
		(this.mediaSource as any) = undefined;
		window.document.body.removeChild(this.$el);
	}

	refreshSliderPosition() {
		const newOffset = -(Screen.width * this.mediaSource.getActiveIndex());
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
