<script lang="ts" setup>
import { onUnmounted } from '@vue/runtime-core';
import { computed, CSSProperties, ref } from 'vue';
import { Analytics } from '../../analytics/analytics.service';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import {
	assignStickerStoreGhostCallback,
	setStickerStoreActiveItem,
	useStickerStore,
} from '../sticker-store';

const stickerStore = useStickerStore();
const { stickerSize, placedItem, isDragging, targetController, isChargingSticker } = stickerStore;

const root = ref<HTMLDivElement>();

/**
 * Used to hide the sticker until we get the proper positioning data. If we
 * don't have this, the sticker may appear in the top-left of the screen before
 * moving to the cursor.
 */
const hasData = ref(false);

let _removeStickerDragCallback = assignStickerStoreGhostCallback(stickerStore, updateGhostPosition);

const sticker = computed(() => stickerStore.sticker.value!);

const chargeButtonPositionClass = ref<'-charge-left' | '-charge-right'>('-charge-left');

const _itemRotation = computed(() =>
	placedItem.value ? `rotate(${placedItem.value.rotation * 90 - 45}deg)` : undefined
);

const itemStyling = computed<CSSProperties>(() => ({
	transform: _itemRotation.value,
	width: stickerSize.value + 'px',
	height: stickerSize.value + 'px',
}));

const itemClasses = computed(() => {
	const classes = [];

	if (!hasData.value) {
		classes.push('-hide');
	}

	if (isDragging.value) {
		classes.push('-dragging');
	}

	if (targetController.value) {
		classes.push('-uncommitted');
	}

	return classes;
});

onUnmounted(() => {
	_removeStickerDragCallback?.();
});

function onStartDrag(event: MouseEvent | TouchEvent) {
	Analytics.trackEvent('sticker-drawer', 'start-drag');
	setStickerStoreActiveItem(stickerStore, sticker.value, event, true);
}

function updateGhostPosition(pos: { left: number; top: number }) {
	if (!root.value) {
		return;
	}

	const { left, top } = pos;
	// Move the charge-button to the other side if we're close to the edge of
	// the screen.
	chargeButtonPositionClass.value = left < 48 ? '-charge-right' : '-charge-left';
	root.value!.style.transform = `translate3d(${left}px, ${top}px, 0)`;
	hasData.value = true;
}
</script>

<template>
	<div ref="root" class="sticker-ghost" :class="itemClasses" @click.stop @contextmenu.prevent>
		<AppAnimElectricity
			class="-img-outer"
			shock-anim="square"
			:disabled="!isChargingSticker"
			@mousedown="onStartDrag"
			@touchstart="onStartDrag"
		>
			<img
				class="-img-inner"
				draggable="false"
				style="user-drag: none"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</AppAnimElectricity>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-ghost
	position: absolute
	top: 0
	left: 0
	cursor: grab
	touch-action: none

.-uncommitted
	filter: drop-shadow(2px 2px 2.5px black)

.-dragging
	filter: drop-shadow(4px 4px 5px black)
	pointer-events: none

.-img-outer
	z-index: 1

.-img-inner
	display: block
	user-select: none
	width: 100%
	height: 100%

.-fade-enter-active
	transition: opacity 250ms $strong-ease-out

.-fade-enter-from
	opacity: 0

.-fade-enter-to
	opacity: 1

.-hide
	visibility: hidden

.-controls
	rounded-corners()
	display: flex
	justify-content: center
	align-items: center
	position: absolute
	top: calc(100% + 8px)
	z-index: 2

.-charge-button
	position: absolute
	bottom: 50%

	&.-charge-left
		right: 100% + 16px

	&.-charge-right
		left: 100% + 16px

.-disabled-button-mask
	img-circle()
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	cursor: not-allowed
</style>
