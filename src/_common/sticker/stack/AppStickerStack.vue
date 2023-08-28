<script lang="ts" setup>
import {
	computed,
	onMounted,
	PropType,
	readonly,
	ref,
	shallowReactive,
	StyleValue,
	toRefs,
	watch,
} from 'vue';
import { arrayRemove, numberSort } from '../../../utils/array';
import AppAnimElectricity from '../../animation/AppAnimElectricity.vue';
import AppPopcornKettle from '../../popcorn/AppPopcornKettle.vue';
import {
	createPopcornKettleController,
	KernelRecipe,
	PopcornKettleController,
} from '../../popcorn/popcorn-kettle-controller';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { useEventSubscription } from '../../system/event/event-topic';
import AppTranslate from '../../translate/AppTranslate.vue';
import { StickerPlacementModel } from '../placement/placement.model';
import { StickerCount } from '../sticker-count';
import { onFiresideStickerPlaced } from '../sticker-store';
import { StickerTargetController, toggleStickersShouldShow } from '../target/target-controller';
import AppStickerStackItem from './AppStickerStackItem.vue';

interface TempKettle {
	key: string;
	style: StyleValue;
	controller: PopcornKettleController;
}

interface StickerAnimation {
	key: string;
	img_url: string;
}

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
	disablePopcorn: {
		type: Boolean,
	},
	/**
	 * Subscribes to an Event that gets data when a sticker is placed on a
	 * fireside.
	 */
	useFiresideSub: {
		type: Boolean,
	},
	baseSize: {
		type: Number,
		default: 32,
	},
	showOverflowCount: {
		type: Boolean,
	},
	/**
	 * Adds a decoration behind sticker rows.
	 */
	card: {
		type: Boolean,
	},
	splitChargedStickers: {
		type: Boolean,
	},
});

const emit = defineEmits({
	/**
	 * Only emits when {@link StickerTargetController.isLive} is false.
	 */
	show: () => true,
});

const {
	controller,
	maxCount,
	reverse,
	disablePopcorn,
	useFiresideSub,
	baseSize,
	showOverflowCount,
	card,
	splitChargedStickers,
} = toRefs(props);

const leadingKettle = createPopcornKettleController();
const trailingKettle = createPopcornKettleController();

const animDuration = 300;
const kernelDuration = 1_000;
const popAngle = -60;

let isPopping = false;
let lastImgUrl = '';

/**
 * Used so that we can spawn a temporary kettle/kernel pair that will animate
 * the kernel to its final destination.
 *
 * If we don't do this, kernels from {@link leadingKettle} will change their
 * position mid-air if {@link props.reverse} is `true` and we're not at our
 * {@link maxCount} yet.
 */
const tempLeadingKettles = shallowReactive<TempKettle[]>([]);

const itemContainer = ref<HTMLElement>();

const allStickers = ref<StickerAnimation[]>([]);
const allChargedStickers = ref<StickerAnimation[]>([]);
initStickers();

const tempAnimatingKernels = ref(0);

const baseKernelOptions = computed<Partial<KernelRecipe>>(() => ({
	duration: kernelDuration,
	velocity: 15 * 0.75,
	downwardGravityStrength: 1.5,
	popAngleVariance: 30,
	baseSize: baseSize.value,
}));

const isLive = computed(() => controller.value.isLive);
const isShowingStickers = computed(() => controller.value.shouldShow.value);

const stickers = computed(() => readonly(allStickers.value.slice(0, maxCount.value)));
const chargedStickers = computed(() => readonly(allChargedStickers.value));

const itemSizeCharged = computed(() => baseSize.value + 8);
const itemOffset = computed(() => baseSize.value / 2);

const showAsActive = computed(() => (isLive.value ? false : isShowingStickers.value));
const showStickerShadows = computed(() => !card.value && !showAsActive.value);

watch(() => controller.value.model.sticker_counts, onModelStickersChanged, { deep: true });

useEventSubscription(onFiresideStickerPlaced, _onFiresideStickerPlaced);

onMounted(() => {
	if (stickers.value.length > 0) {
		lastImgUrl = stickers.value[0].img_url;
	}
});

function initStickers() {
	const newStickers: StickerCount[] = [];
	const newChargedStickers: StickerCount[] = [];

	controller.value.model.sticker_counts.forEach(i => {
		if (!splitChargedStickers.value) {
			newStickers.push({
				...i,
				chargedCount: 0,
			});
			return;
		}

		if (i.chargedCount > 0) {
			newChargedStickers.push({
				...i,
				count: 0,
			});
		}

		const nonChargedCount = i.count - i.chargedCount;
		if (nonChargedCount > 0) {
			newStickers.push({
				...i,
				count: nonChargedCount,
				chargedCount: 0,
			});
		}
	});

	const getSorted = (list: StickerCount[], field: 'chargedCount' | 'count') => {
		const keyExtras = field === 'chargedCount' ? '-charged' : '';

		return list
			.sort((a, b) => numberSort(b[field], a[field]))
			.map((i, index) => ({ key: `${Date.now()}${keyExtras}-${index}`, img_url: i.imgUrl }));
	};

	allStickers.value = getSorted(newStickers, 'count');
	allChargedStickers.value = getSorted(newChargedStickers, 'chargedCount');
}

function onModelStickersChanged() {
	if (useFiresideSub.value) {
		return;
	}

	initStickers();
}

function _onFiresideStickerPlaced(placement: StickerPlacementModel) {
	if (!useFiresideSub.value) {
		return;
	}

	const { img_url } = placement.sticker;

	if (splitChargedStickers.value && placement.is_charged) {
		const existing = allChargedStickers.value.find(i => i.img_url === img_url);
		if (!existing) {
			allChargedStickers.value.push({
				key: `${Date.now()}-charged`,
				img_url,
			});
		}
		return;
	}

	if (lastImgUrl === img_url) {
		const element = itemContainer.value?.firstElementChild as HTMLElement | undefined;
		// Do nothing if the current lead sticker is different than the one we
		// just got. This can happen a sticker is mid-air and the same sticker
		// is placed.
		if (!element || img_url !== allStickers.value[0].img_url) {
			return;
		}

		const lockClass = '--lock';
		const animClass = '-animate';
		if (element.classList.contains(animClass)) {
			element.classList.add(lockClass);
			return;
		}
		element.classList.add(animClass);

		const queueAnimationEnd = () => {
			return setTimeout(() => {
				if (element.classList.contains(lockClass)) {
					element.classList.remove(lockClass);
					queueAnimationEnd();
					return;
				}
				return element.classList.remove(animClass);
			}, animDuration);
		};

		queueAnimationEnd();
		return;
	}

	lastImgUrl = img_url;

	const key = Date.now().toString();

	let kettle: PopcornKettleController | null = null;
	let tempKettle: TempKettle | null = null;

	const onKettleDispose = () => {
		if (tempKettle) {
			arrayRemove(tempLeadingKettles, i => i.key === tempKettle?.key);
			tempAnimatingKernels.value = Math.max(0, tempAnimatingKernels.value - 1);
		}

		const lengthBeforeInsert = stickers.value.length;
		const needsPopped = lengthBeforeInsert >= maxCount.value;
		allStickers.value.unshift({ key, img_url });

		if (isPopping || !needsPopped) {
			return;
		}

		let extraCount = lengthBeforeInsert + 1 - maxCount.value;
		if (disablePopcorn.value || extraCount <= 0) {
			return;
		}

		isPopping = true;
		while (extraCount > 0) {
			--extraCount;

			const sticker = allStickers.value[stickers.value.length + extraCount];

			trailingKettle.addKernel({
				kernelImage: sticker!.img_url,
				...baseKernelOptions,
				popAngle: -popAngle,
			});
		}
		isPopping = false;
	};

	if (allStickers.value.length < maxCount.value) {
		++tempAnimatingKernels.value;
		kettle = createPopcornKettleController();
		tempKettle = {
			key,
			controller: kettle,
			style: {
				right:
					itemOffset.value *
						Math.min(
							allStickers.value.length + tempAnimatingKernels.value,
							maxCount.value
						) +
					'px',
			},
		};
		tempLeadingKettles.push(tempKettle);
	} else {
		kettle = leadingKettle;
	}

	kettle.addKernel({
		kernelImage: img_url,
		...baseKernelOptions,
		popAngle,
		reverse: true,
		fadeOut: false,
		zIndexInvert: true,
		onDispose: onKettleDispose,
	});
}

function onClick() {
	// Stickers in a Live context will automatically remove themselves - do
	// nothing.
	if (isLive.value) {
		return;
	}

	toggleStickersShouldShow(controller.value, true);

	if (isShowingStickers.value) {
		emit('show');
	}
}
</script>

<template>
	<div
		class="sticker-stack"
		:class="{
			'-hoverable': !isLive,
			'-active': showAsActive,
			'-card': card,
		}"
		@click="onClick"
	>
		<div class="-sections">
			<template v-if="splitChargedStickers && chargedStickers.length > 0">
				<div v-for="{ key, img_url } of chargedStickers" :key="key" class="-item-charged">
					<AppAnimElectricity ignore-asset-padding>
						<AppStickerStackItem
							:class="{ '-item-shadow': showStickerShadows }"
							:img-url="img_url"
							:style="{
								width: itemSizeCharged + 'px',
							}"
						/>
					</AppAnimElectricity>
				</div>
			</template>

			<div v-if="stickers.length > 0" class="-reaction-items">
				<div
					ref="itemContainer"
					class="-item-container"
					:class="{ '-item-shadow': showStickerShadows }"
					:style="{
						width:
							itemOffset *
								(Math.min(stickers.length + tempAnimatingKernels, maxCount) + 1) +
							'px',
						height: baseSize + 'px',
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
										right: itemOffset * (stickers.length - 1 - index) + 'px',
								  }
								: {
										left: itemOffset * index + 'px',
								  }),
						}"
					>
						<AppStickerStackItem
							:img-url="img_url"
							:style="{
								width: baseSize + 'px',
							}"
						/>
					</div>

					<div
						class="-kettle-lead"
						:style="{
							left: reverse && stickers.length < maxCount ? '0px' : itemOffset + 'px',
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

				<div v-if="showOverflowCount && allStickers.length - maxCount > 0" class="-count">
					<AppSpacer horizontal :scale="1" />
					<AppTranslate :translate-params="{ count: allStickers.length - maxCount }">
						+%{ count } more
					</AppTranslate>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-stack
	--border-color: transparent
	position: relative
	border: $border-width-small solid var(--border-color)

	&.-hoverable:hover
	&.-card
		--fill-color: var(--theme-bg-offset)

	&.-hoverable:hover
	&.-active
		background-color: var(--fill-color)

	&.-hoverable
		rounded-corners()
		cursor: pointer

		&.-active
			--border-color: var(--theme-primary)

	&.-card
		.-item-charged
		.-reaction-items
			rounded-corners()
			background-color: var(--fill-color)

		.-item-charged
			padding: 4px

		.-reaction-items
			padding: 8px 6px 8px 4px

.-sections
	display: flex
	flex-wrap: wrap
	align-items: center
	gap: 8px

.-reaction-items
.-item-container
	position: relative
	display: inline-flex
	flex-wrap: nowrap
	align-items: center
	z-index: 1

.-item-container
	height: 100%
	position: relative

.-item-shadow
	filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15)) drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.15))

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

.-count
	white-space: nowrap
	font-size: $font-size-tiny

@keyframes anim-item-add
	0%
		transform: scale(1)
	50%
		transform: scale(1.1)
	100%
		transform: scale(1)
</style>
