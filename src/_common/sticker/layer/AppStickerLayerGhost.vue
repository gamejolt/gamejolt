<script lang="ts" setup>
import { onUnmounted } from '@vue/runtime-core';
import { computed, CSSProperties, onMounted, ref } from 'vue';
import { Analytics } from '../../analytics/analytics.service';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppButton from '../../button/AppButton.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
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
	canPlaceChargedStickerOnResource,
} = stickerStore;

const root = ref<HTMLDivElement>();

let _removeStickerDragCallback: (() => void) | null = null;
const _isConfirmingPlacement = ref(false);

const sticker = computed(() => stickerStore.sticker.value!);

const shouldShowStickerControls = computed(() => !!placedItem.value);
const chargeButtonPositionClass = ref<'-charge-left' | '-charge-right'>('-charge-left');

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
	_removeStickerDragCallback = assignStickerStoreGhostCallback(stickerStore, updateGhostPosition);
});

onUnmounted(() => {
	_removeStickerDragCallback?.();
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
	if (!root.value) {
		return;
	}

	const { left, top } = pos;
	// Move the charge-button to the other side if we're close to the edge of
	// the screen.
	chargeButtonPositionClass.value = left < 48 ? '-charge-right' : '-charge-left';
	root.value!.style.transform = `translate3d(${left}px, ${top}px, 0)`;
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

		<transition name="-fade">
			<div v-if="shouldShowStickerControls" class="-controls" :style="controlsStyling">
				<AppButton
					icon="check"
					:primary="canPlaceChargedStickerOnResource ? isChargingSticker : true"
					solid
					sparse
					circle
					@click.capture="onConfirmPlacement"
				/>

				<AppAnimElectricity
					v-if="!isChargingSticker"
					:disabled="!canPlaceChargedStickerOnResource"
					shock-anim="square"
					class="-charge-button"
					:class="chargeButtonPositionClass"
				>
					<!-- TODO(charged-stickers) charge icon -->
					<AppButton
						icon="bolt-filled"
						:primary="canPlaceChargedStickerOnResource"
						solid
						sparse
						circle
						:disabled="!canPlaceChargedStickerOnResource"
						@click.capture="isChargingSticker = true"
					/>
					<!-- Attaching a tooltip directly to the button or
					[AppAnimElectricity] can have layering issues. -->
					<div
						v-if="!canPlaceChargedStickerOnResource"
						v-app-tooltip.touchable="canChargeSticker
								? $gettext(`Charged stickers can only be placed on creators.`)
								: $gettext(`You're not able to charge this sticker yet.`),
						"
						class="-disabled-button-mask"
					/>
				</AppAnimElectricity>
			</div>
		</transition>
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
