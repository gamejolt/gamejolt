<script lang="ts" setup>
import { onUnmounted, ref, toRef } from 'vue';
import { styleBorderRadiusLg, styleChangeBg, styleWhen } from '../../../_styles/mixins';
import { Analytics } from '../../analytics/analytics.service';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppJolticon from '../../jolticon/AppJolticon.vue';
import AppSlider from '../../slider/AppSlider.vue';
import AppStickerImg from '../AppStickerImg.vue';
import {
	assignStickerStoreGhostCallback,
	setStickerStoreActiveItem,
	useStickerStore,
} from '../sticker-store';

const stickerStore = useStickerStore();
const { ghostStickerSize, placedItem, isDragging, targetController, isChargingSticker } =
	stickerStore;

const root = ref<HTMLDivElement>();

/**
 * Used to hide the sticker until we get the proper positioning data. If we
 * don't have this, the sticker may appear in the top-left of the screen before
 * moving to the cursor.
 */
const hasData = ref(false);

let _removeStickerDragCallback = assignStickerStoreGhostCallback(stickerStore, updateGhostPosition);

const sticker = toRef(() => stickerStore.sticker.value!);

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
	root.value.style.transform = `translate3d(${left}px, ${top}px, 0)`;
	hasData.value = true;
}

const rotation = toRef(() => (placedItem.value ? placedItem.value.rotation * 90 - 45 : 0));

function sliverValueTooltip(value: number) {
	// Displays -100% to 100%, with 0% at the middle of the slider.
	return `${value * 2 - 100}%`;
}
</script>

<template>
	<div
		ref="root"
		:style="{
			position: `absolute`,
			top: `0`,
			left: `0`,
			cursor: `grab`,
			touchAction: `none`,
			...styleWhen(!hasData, {
				visibility: `hidden`,
			}),
			...styleWhen(isDragging, {
				filter: `drop-shadow(4px 4px 5px black)`,
				pointerEvents: `none`,
			}),
			...styleWhen(!!targetController, {
				filter: `drop-shadow(2px 2px 2.5px black)`,
			}),
		}"
		@click.stop
		@contextmenu.prevent
	>
		<AppAnimElectricity
			:style="{
				zIndex: 1,
			}"
			shock-anim="square"
			:disabled="!isChargingSticker"
			ignore-asset-padding
			@mousedown="onStartDrag"
			@touchstart="onStartDrag"
		>
			<AppStickerImg
				:style="{
					display: `block`,
					userSelect: `none`,
					...styleWhen(!!placedItem, {
						transform: `rotate(${rotation}deg)`,
					}),
				}"
				:src="sticker.img_url"
				:size="ghostStickerSize.value"
			/>
		</AppAnimElectricity>

		<div
			v-if="placedItem"
			:style="{
				...styleBorderRadiusLg,
				...styleChangeBg('bg-offset'),
				position: `absolute`,
				left: `50%`,
				top: `100%`,
				transform: `translate(-50%, 16px)`,
				display: `inline-flex`,
				gap: `12px`,
				padding: `4px 8px`,
			}"
		>
			<AppSlider
				:style="{
					width: `100px`,
				}"
				:percent="placedItem.rotation"
				:slider-value-tooltip="sliverValueTooltip"
				@scrub="placedItem.rotation = $event.percent"
			/>

			<!-- TODO(sticker-drawer-item-enlarge) jolticon -->
			<AppJolticon :style="{ margin: 0, fontSize: `24px` }" icon="sparkles" />
		</div>
	</div>
</template>
