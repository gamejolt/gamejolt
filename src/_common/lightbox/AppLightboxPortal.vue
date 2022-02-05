<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { Analytics } from '../analytics/analytics.service';
import { EscapeStack, EscapeStackCallback } from '../escape-stack/escape-stack.service';
import { onScreenResize, Screen } from '../screen/screen-service';
import AppShortkey from '../shortkey/AppShortkey.vue';
import { EventSubscription } from '../system/event/event-topic';
import AppTouch, { AppTouchInput } from '../touch/AppTouch.vue';
import AppLightboxItem from './item/item.vue';
import { getActiveLightbox } from './lightbox-helpers';

// The class we add to the document body when we have an active lightbox.
const lightboxClass = 'media-bar-lightbox-open';

const root = ref<null | HTMLElement>(null);
const slider = ref<null | HTMLElement>(null);

let currentSliderOffset = 0;
const isDragging = ref(false);

const lightbox = computed(() => getActiveLightbox());

const items = computed(() => {
	if (!lightbox.value) {
		return [];
	}
	return lightbox.value.items;
});

const activeIndex = computed(() => {
	if (!lightbox.value) {
		return 0;
	}
	return lightbox.value.index;
});

const hasNext = computed(() => {
	if (!lightbox.value) {
		return false;
	}
	return activeIndex.value < lightbox.value.length - 1;
});

const activeMediaItem = computed(() => {
	if (!lightbox.value || !lightbox.value.activeItem) {
		return null;
	}
	return lightbox.value.activeItem.getMediaItem();
});

const activeMediaType = computed(() => {
	if (!lightbox.value || !lightbox.value.activeItem) {
		return null;
	}
	return lightbox.value.activeItem.getMediaType();
});

let resize$: EventSubscription | null = null;
let escapeCallback: EscapeStackCallback | null = null;

// We need to watch for changes of the lightbox instance and its data.
watch(
	lightbox,
	async () => {
		if (!lightbox.value || !lightbox.value.length) {
			lightbox.value?.close();
			_onClose();
			return;
		}

		_onShow();
	},
	{ deep: true }
);

async function _onShow() {
	document.body.classList.add(lightboxClass);
	resize$ = onScreenResize.subscribe(refreshSliderPosition);

	escapeCallback = () => close();
	EscapeStack.register(escapeCallback);
	await nextTick();
	refreshSliderPosition();
}

function _onClose() {
	document.body.classList.remove(lightboxClass);

	resize$?.close();

	if (escapeCallback) {
		EscapeStack.deregister(escapeCallback);
		escapeCallback = null;
	}

	currentSliderOffset = 0;
	isDragging.value = false;
}

function goNext() {
	if (!lightbox.value) {
		return;
	}
	lightbox.value.goNext();
	refreshSliderPosition();
}

function goPrev() {
	if (!lightbox.value) {
		return;
	}
	lightbox.value.goPrev();
	refreshSliderPosition();
}

function close() {
	if (lightbox.value) {
		lightbox.value.close();
	}
}

function refreshSliderPosition() {
	const newOffset = -(Screen.width * activeIndex.value);
	if (slider.value) {
		slider.value.style.transform = `translate3d( ${newOffset}px, 0, 0 )`;
	}
	currentSliderOffset = newOffset;
}

function panStart() {
	isDragging.value = true;
}

function pan(event: AppTouchInput) {
	// In case the animation frame was retrieved after we stopped dragging.
	if (!isDragging.value) {
		return;
	}

	if (!slider.value) {
		return;
	}

	slider.value.style.transform = `translate3d( ${currentSliderOffset + event.deltaX}px, 0, 0 )`;
}

function panEnd(event: AppTouchInput) {
	isDragging.value = false;

	// $el.classList.remove('dragging');

	// Make sure we moved at a high enough velocity and/or distance to register the "swipe".
	const { velocityX, deltaX, distance } = event;

	if (
		// Check if it was a fast flick,
		(Math.abs(velocityX) > 0.55 && distance > 10) ||
		// or if the pan distance was at least ~1/3 of the content area.

		Math.abs(deltaX) >= root.value!.clientWidth / 3
	) {
		if (velocityX > 0 || deltaX > 0) {
			goPrev();
			Analytics.trackEvent('media-bar', 'swiped-prev');
		} else {
			goNext();
			Analytics.trackEvent('media-bar', 'swiped-next');
		}
		return;
	}

	// We don't change the active item and instead just refresh the slider position.
	// This should reset the position after us moving it in drag().
	refreshSliderPosition();
}
</script>

<template>
	<div v-if="lightbox" ref="root" :class="{ dragging: isDragging }">
		<AppTouch
			class="media-bar-lightbox theme-dark"
			:pan-options="{ threshold: 0 }"
			@panstart="panStart"
			@panmove="pan"
			@panend="panEnd"
		>
			<AppShortkey shortkey="arrowleft" @press="goPrev" />
			<AppShortkey shortkey="arrowright" @press="goNext" />

			<div class="-inner">
				<div class="-controls">
					<a v-if="activeIndex > 0" class="-prev" @click="goPrev">
						<AppJolticon icon="chevron-left" />
					</a>
					<div v-else class="-prev -hideable" />

					<div>
						<AppButton
							v-if="activeMediaItem && activeMediaType === 'image'"
							icon="download"
							trans
							:href="activeMediaItem.img_url"
							target="_blank"
						>
							<AppTranslate>Download</AppTranslate>
						</AppButton>
						<AppButton @click="close">
							<AppTranslate>Close</AppTranslate>
						</AppButton>
					</div>

					<a v-if="hasNext" class="-next" @click="goNext">
						<AppJolticon icon="chevron-right" />
					</a>
					<div v-else class="-next -hideable" />
				</div>

				<div ref="slider" class="-slider">
					<AppLightboxItem
						v-for="(item, index) of items"
						:key="item.getModelId()"
						:item="item"
						:item-index="index"
						:active-index="activeIndex"
					/>
				</div>
			</div>
		</AppTouch>
	</div>
</template>

<style lang="stylus" src="./lightbox-global.styl"></style>
<style lang="stylus" src="./lightbox.styl" scoped></style>
