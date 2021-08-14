import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../analytics/analytics.service';
import { EscapeStack, EscapeStackCallback } from '../escape-stack/escape-stack.service';
import { onScreenResize, Screen } from '../screen/screen-service';
import AppShortkey from '../shortkey/shortkey.vue';
import { EventSubscription } from '../system/event/event-topic';
import AppLightboxItem from './item/item.vue';
import { LightboxMediaSource } from './lightbox-helpers';
import AppLightboxSlider from './slider.vue';

// TODO(vue3)
// if (!GJ_IS_SSR) {
// 	const VueTouch = require('vue-touch');
// 	VueGlobal.use(VueTouch);
// }

@Options({
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

		this.resize$ = onScreenResize.subscribe(() => {
			this.refreshSliderPosition();
		});

		this.escapeCallback = () => this.close();
		EscapeStack.register(this.escapeCallback);
	}

	unmounted() {
		document.body.classList.remove('media-bar-lightbox-open');

		this.resize$?.close();

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

		this.sliderElem.style.transform = `translate3d( ${
			this.currentSliderOffset + event.deltaX
		}px, 0, 0 )`;
	}

	panEnd(event: HammerInput) {
		this.isDragging = false;

		this.$el.classList.remove('dragging');

		// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
		const { velocityX, deltaX, distance } = event;

		if (
			// Check if it was a fast flick,
			(Math.abs(velocityX) > 0.55 && distance > 10) ||
			// or if the pan distance was at least ~1/3 of the content area.
			Math.abs(deltaX) >= this.$el.clientWidth / 3
		) {
			if (velocityX > 0 || deltaX > 0) {
				this.goPrev();
				Analytics.trackEvent('media-bar', 'swiped-prev');
			} else {
				this.goNext();
				Analytics.trackEvent('media-bar', 'swiped-next');
			}
			return;
		}

		// We don't change the active item and instead just refresh the slider position.
		// This should reset the position after us moving it in drag().
		this.refreshSliderPosition();
	}
}
