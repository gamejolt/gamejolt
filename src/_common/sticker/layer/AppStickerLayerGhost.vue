<script lang="ts" setup>
import { computed, CSSProperties, onMounted, ref } from 'vue';
import { Analytics } from '../../analytics/analytics.service';
import AppButton from '../../button/AppButton.vue';
import {
	assignStickerStoreGhostCallback,
	commitStickerStoreItemPlacement,
	setStickerStoreActiveItem,
	useStickerStore,
} from '../sticker-store';

const stickerStore = useStickerStore();
const {
	stickerSize,
	placedItem,
	isDragging,
	targetController,
	canChargeSticker,
	isChargingSticker,
} = stickerStore;

const root = ref<HTMLDivElement>();

const _isConfirmingPlacement = ref(false);

const sticker = computed(() => stickerStore.sticker.value!);

const shouldShowStickerControls = computed(() => !!placedItem.value);

const _itemRotation = computed(() =>
	placedItem.value ? `rotate(${placedItem.value.rotation * 90 - 45}deg)` : undefined
);

const itemStyling = computed<CSSProperties>(() => ({
	transform: _itemRotation.value,
	width: stickerSize.value + 'px',
	height: stickerSize.value + 'px',
}));

const controlsStyling = computed<CSSProperties>(() => {
	const controlSize = 32;
	return {
		left: stickerSize.value / 2 - controlSize / 2 + 'px',
		width: controlSize + 'px',
		height: controlSize + 'px',
	};
});

const itemClasses = computed(() => {
	const classes = [];

	if (isDragging.value) {
		classes.push('-dragging');
	}

	if (targetController.value) {
		classes.push('-uncommitted');
	}

	return classes;
});

onMounted(() => {
	assignStickerStoreGhostCallback(stickerStore, updateGhostPosition);
});

async function onConfirmPlacement() {
	// Only allow 1 placement request through at a time for each sticker
	// ghost. This component will be v-if'd away after placement if it
	// doesn't fail.
	if (_isConfirmingPlacement.value) {
		return;
	}
	_isConfirmingPlacement.value = true;
	Analytics.trackEvent('sticker-drawer', 'confirm-placement');
	await commitStickerStoreItemPlacement(stickerStore);
	_isConfirmingPlacement.value = false;
}

function onStartDrag(event: MouseEvent | TouchEvent) {
	Analytics.trackEvent('sticker-drawer', 'start-drag');
	setStickerStoreActiveItem(stickerStore, sticker.value, event, true);
}

function updateGhostPosition(pos: { left: number; top: number }) {
	const { left, top } = pos;
	root.value!.style.transform = `translate3d(${left}px, ${top}px, 0)`;
}
</script>

<template>
	<div ref="root" class="sticker-ghost" :class="itemClasses" @click.stop @contextmenu.prevent>
		<div class="-img-outer" @mousedown="onStartDrag" @touchstart="onStartDrag">
			<img
				class="-img-inner"
				draggable="false"
				style="user-drag: none"
				:style="itemStyling"
				:src="sticker.img_url"
				@dragstart.prevent
			/>
		</div>

		<transition name="-fade">
			<div v-if="shouldShowStickerControls" class="-controls" :style="controlsStyling">
				<!-- TODO(charged-stickers) charge icon -->
				<AppButton
					v-if="!isChargingSticker"
					icon="bolt-filled"
					solid
					sparse
					circle
					:disabled="!canChargeSticker"
					@click.capture="isChargingSticker = true"
				/>
				<AppButton
					icon="check"
					primary
					solid
					sparse
					circle
					@click.capture="onConfirmPlacement"
				/>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.-uncommitted
	filter: drop-shadow(2px 2px 2.5px black)

.-dragging
	filter: drop-shadow(4px 4px 5px black)
	pointer-events: none

.sticker-ghost
	position: absolute
	top: 0
	left: 0
	cursor: grab
	touch-action: none

.-img-outer
	z-index: 2

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

.-controls
	rounded-corners()
	display: flex
	justify-content: center
	align-items: center
	position: absolute
	top: calc(100% + 8px)
	z-index: 1
</style>
