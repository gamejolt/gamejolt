<script lang="ts" setup>
import { nextTick, onWatcherCleanup, ref, toRef, watch } from 'vue';

import AppButton from '~common/button/AppButton.vue';
import { useEscapeStack } from '~common/escape-stack/escape-stack.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLightboxItem from '~common/lightbox/item/AppLightboxItem.vue';
import { getActiveLightbox } from '~common/lightbox/lightbox-helpers';
import { onScreenResize, Screen } from '~common/screen/screen-service';
import AppTouch, { AppTouchInput } from '~common/touch/AppTouch.vue';
import { $gettext } from '~common/translate/translate.service';

// The class we add to the document body when we have an active lightbox.
const lightboxClass = 'media-bar-lightbox-open';

const root = ref<null | HTMLElement>(null);
const slider = ref<null | HTMLElement>(null);

let currentSliderOffset = 0;
const isDragging = ref(false);

const lightbox = toRef(() => getActiveLightbox());

const items = toRef(() => (lightbox.value ? lightbox.value.items : []));
const activeIndex = toRef(() => (lightbox.value ? lightbox.value.index : 0));

const hasNext = toRef(() =>
	lightbox.value ? activeIndex.value < lightbox.value.length - 1 : false
);

const activeMediaItem = toRef(() => {
	if (!lightbox.value || !lightbox.value.activeItem) {
		return null;
	}
	return lightbox.value.activeItem.getMediaItem();
});

const activeMediaType = toRef(() => {
	if (!lightbox.value || !lightbox.value.activeItem) {
		return null;
	}
	return lightbox.value.activeItem.getMediaType();
});

useEscapeStack({
	onEscape: () => close(),
	enabled: () => !!lightbox.value?.length,
});

watch(
	() => !!lightbox.value,
	async isOpen => {
		if (!isOpen) {
			return;
		}

		document.body.classList.add(lightboxClass);
		const resize$ = onScreenResize.subscribe(refreshSliderPosition);

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				goPrev();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				goNext();
			}
		};
		document.addEventListener('keydown', onKeyDown);

		onWatcherCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);

			document.body.classList.remove(lightboxClass);

			resize$.close();

			currentSliderOffset = 0;
			isDragging.value = false;
		});

		await nextTick();
		refreshSliderPosition();
	}
);

// Keep the slider position in sync with the active item if it changes outside
// of the local goNext/goPrev wrappers (which refresh inline).
watch(activeIndex, () => {
	nextTick(refreshSliderPosition);
});

// Auto-close the lightbox if its items are emptied during a session.
watch(
	() => lightbox.value?.length ?? 0,
	length => {
		if (lightbox.value && length === 0) {
			lightbox.value.close();
		}
	}
);

function goNext() {
	if (!lightbox.value) {
		return;
	}
	lightbox.value.goNext();
}

function goPrev() {
	if (!lightbox.value) {
		return;
	}
	lightbox.value.goPrev();
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
		} else {
			goNext();
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
							{{ $gettext(`Download`) }}
						</AppButton>
						<AppButton @click="close">
							{{ $gettext(`Close`) }}
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

<style lang="stylus" src="~common/lightbox/lightbox-global.styl"></style>
<style lang="stylus" src="~common/lightbox/lightbox.styl" scoped></style>
