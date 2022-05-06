<script lang="ts">
import { PropType, ref, toRefs } from 'vue';
import { numberSort } from '../../../utils/array';
import { onFiresideStickerPlaced } from '../../drawer/drawer-store';
import AppPopcornKettle from '../../popcorn/AppPopcornKettle.vue';
import {
	createPopcornKettleController,
	KernelRecipe,
} from '../../popcorn/popcorn-kettle-controller';
import { useEventSubscription } from '../../system/event/event-topic';
import { StickerPlacement } from '../placement/placement.model';
import { StickerTargetController } from '../target/target-controller';
import AppStickerLiveReactionsItem from './AppStickerLiveReactionsItem.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	controller: {
		type: Object as PropType<StickerTargetController>,
		required: true,
	},
	maxCount: {
		type: Number,
		default: 10,
	},
	/**
	 * Use if the reactions are pinned to the right edge of a container instead
	 * of the left.
	 */
	reverse: {
		type: Boolean,
	},
});

const { controller, maxCount } = toRefs(props);

const leadingKettle = createPopcornKettleController();
const trailingKettle = createPopcornKettleController();

useEventSubscription(onFiresideStickerPlaced, onStickerPlaced);

const kernelDuration = 1_000;
const popAngle = -60;

const baseKernelOptions: Partial<KernelRecipe> = {
	duration: kernelDuration,
	baseSize: 40,
	velocity: 15 * 0.75,
	downwardGravityStrength: 1.5,
	popAngleVariance: 30,
};

let isPopping = false;

const stickers = ref(
	controller.value.model.sticker_counts
		.sort((a, b) => numberSort(b.count, a.count))
		.slice(0, maxCount.value)
		.map((i, index) => ({ key: `${Date.now()}-${index}`, img_url: i.imgUrl }))
);

function onStickerPlaced(placement: StickerPlacement) {
	const { img_url } = placement.sticker;

	const key = Date.now().toString();

	leadingKettle.addKernel(img_url, {
		...baseKernelOptions,
		popAngle,
		reverse: true,
		reverseFadeOut: false,
		onDispose: () => {
			stickers.value.unshift({ key, img_url });
			if (isPopping) {
				return;
			}

			if (stickers.value.length > maxCount.value) {
				isPopping = true;
				while (stickers.value.length > maxCount.value) {
					trailingKettle.addKernel(stickers.value.pop()!.img_url, {
						...baseKernelOptions,
						popAngle: -popAngle,
						forwardFadeIn: false,
					});
				}
				isPopping = false;
			}
		},
	});
}
</script>

<template>
	<div class="sticker-live-reactions" @click="stickers = []">
		<div class="-reaction-items">
			<div
				:style="{
					width: 20 * (stickers.length + 1) + 'px',
					transition: reverse ? `width 150ms linear` : undefined,
					height: '100%',
					filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))',
				}"
			>
				<div
					v-for="({ key, img_url: url }, index) of stickers"
					:key="key"
					class="-item"
					:class="{
						'-reverse': reverse,
					}"
					:style="{
						zIndex: -index,
						...(reverse
							? {
									right: 20 * (stickers.length - 1 - index) + 'px',
							  }
							: {
									left: 20 * index + 'px',
							  }),
					}"
				>
					<AppStickerLiveReactionsItem
						:img-url="url"
						:style="{
							width: '40px',
						}"
					/>
				</div>
			</div>

			<div
				class="-kettle-lead"
				:style="{
					left: reverse && stickers.length < maxCount ? '0px' : '20px',
				}"
			>
				<AppPopcornKettle :controller="leadingKettle" />
			</div>

			<div
				class="-kettle-trail"
				:style="{
					zIndex: -maxCount,
				}"
			>
				<AppPopcornKettle :controller="trailingKettle" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-live-reactions
	position: relative
	display: inline-flex
	flex-wrap: nowrap
	grid-gap: 16px

.-reaction-items
	position: relative
	display: inline-flex
	flex-wrap: nowrap
	height: 40px
	z-index: 1
	align-items: center

.-item
	position: absolute
	left: -20px
	transition: left 200ms

	&.-reverse
		left: unset
		right: 0
		transition: right 200ms

.-kettle-lead
	position: absolute
	left: 20px
	z-index: 1
	transition: left 200ms

.-kettle-trail
	position: absolute
	right: 20px
</style>
