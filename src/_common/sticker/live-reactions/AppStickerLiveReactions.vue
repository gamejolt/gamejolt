<script lang="ts">
import { onMounted, PropType, ref, shallowReactive, StyleValue, toRefs } from 'vue';
import { arrayRemove, numberSort } from '../../../utils/array';
import { onFiresideStickerPlaced } from '../../drawer/drawer-store';
import AppPopcornKettle from '../../popcorn/AppPopcornKettle.vue';
import {
	createPopcornKettleController,
	KernelRecipe,
	PopcornKettleController,
} from '../../popcorn/popcorn-kettle-controller';
import { useEventSubscription } from '../../system/event/event-topic';
import { StickerPlacement } from '../placement/placement.model';
import { StickerTargetController } from '../target/target-controller';
import AppStickerLiveReactionsItem from './AppStickerLiveReactionsItem.vue';

interface TempKettle {
	key: string;
	style: StyleValue;
	controller: PopcornKettleController;
}
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

/**
 * Used so that we can spawn a temporary kettle/kernel pair that will animate
 * the kernel to its final destination.
 *
 * If we don't do this, kernels from {@link leadingKettle} will change their
 * position mid-air if {@link props.reverse} is `true` and we're not at our
 * {@link maxCount} yet.
 */
const tempLeadingKettles = shallowReactive<TempKettle[]>([]);

useEventSubscription(onFiresideStickerPlaced, onStickerPlaced);

const animDuration = 300;
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
let lastImgUrl = '';

const itemContainer = ref<HTMLElement>();

const stickers = ref(
	controller.value.model.sticker_counts
		.sort((a, b) => numberSort(b.count, a.count))
		.slice(0, maxCount.value)
		.map((i, index) => ({ key: `${Date.now()}-${index}`, img_url: i.imgUrl }))
);

const tempAnimatingKernels = ref(0);

onMounted(() => {
	if (stickers.value.length > 0) {
		lastImgUrl = stickers.value[0].img_url;
	}
});

function onStickerPlaced(placement: StickerPlacement) {
	const { img_url } = placement.sticker;

	if (lastImgUrl === img_url) {
		const element = itemContainer.value?.firstElementChild as HTMLElement | undefined;
		// Do nothing if the current lead sticker is different than the one we
		// just got. This can happen a sticker is mid-air and the same sticker
		// is placed.
		if (!element || img_url !== stickers.value[0].img_url) {
			return;
		}

		const lockClass = '--lock';
		const animClass = '-animate';
		if (element.classList.contains(animClass)) {
			element.classList.add(lockClass);
			return;
		}
		element.classList.add(animClass);

		const queueAnimationEnd = () =>
			setTimeout(() => {
				if (element.classList.contains(lockClass)) {
					element.classList.remove(lockClass);
					queueAnimationEnd();
					return;
				}
				return element.classList.remove(animClass);
			}, animDuration);

		queueAnimationEnd();
		return;
	}
	lastImgUrl = img_url;

	const key = Date.now().toString();

	let kettle: PopcornKettleController;
	let tempKettle: TempKettle | null = null;

	if (stickers.value.length < maxCount.value) {
		++tempAnimatingKernels.value;
		kettle = createPopcornKettleController();
		tempKettle = {
			key,
			controller: kettle,
			style: {
				right:
					20 *
						Math.min(
							stickers.value.length + tempAnimatingKernels.value,
							maxCount.value
						) +
					'px',
			},
		};
		tempLeadingKettles.push(tempKettle);
	} else {
		kettle = leadingKettle;
	}

	kettle.addKernel(img_url, {
		...baseKernelOptions,
		popAngle,
		reverse: true,
		fadeOut: false,
		zIndexInvert: true,
		onDispose: () => {
			if (tempKettle) {
				arrayRemove(tempLeadingKettles, i => i.key === tempKettle?.key);
				--tempAnimatingKernels.value;
			}

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
					});
				}
				isPopping = false;
			}
		},
	});
}
</script>

<template>
	<div class="sticker-live-reactions">
		<div class="-reaction-items">
			<div
				ref="itemContainer"
				:style="{
					width:
						20 * (Math.min(stickers.length + tempAnimatingKernels, maxCount) + 1) +
						'px',
					height: '100%',
					filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))',
				}"
			>
				<div
					v-for="({ key, img_url }, index) of stickers"
					:key="key"
					class="-item"
					:class="{
						'-reverse': reverse,
					}"
					:style="{
						zIndex: -index,
						animationDuration: animDuration + 'ms',
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
						:img-url="img_url"
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
				v-for="kettle of tempLeadingKettles"
				:key="kettle.key"
				class="-kettle-lead-temp"
				:style="kettle.style"
			>
				<AppPopcornKettle :controller="kettle.controller" />
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
	transform: scale(1)
	transition-property: left
	transition-duration: 200ms
	transition-timing-function: $weak-ease-out

	&.-reverse
		left: unset
		right: 0
		transition-property: right

	&.-animate
		animation-name: anim-item-add
		animation-iteration-count: infinite
		animation-duration: 200ms

.-kettle-lead
	position: absolute
	left: 20px
	z-index: 1
	transition-property: left
	transition-duration: 200ms
	transition-timing-function: $strong-ease-out

.-kettle-lead-temp
	position: absolute
	z-index: 1

.-kettle-trail
	position: absolute
	right: 20px

@keyframes anim-item-add
	0%
		transform: scale(1)
	50%
		transform: scale(1.1)
	100%
		transform: scale(1)
</style>
