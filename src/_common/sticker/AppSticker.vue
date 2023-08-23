<script lang="ts" setup>
import {
	CSSProperties,
	PropType,
	Ref,
	computed,
	nextTick,
	onMounted,
	ref,
	toRefs,
	watch,
} from 'vue';
import AppAnimElectricity from '../animation/AppAnimElectricity.vue';
import AppStickerImg from './AppStickerImg.vue';
import { StickerPlacement } from './placement/placement.model';
import { StickerTargetController, removeStickerFromTarget } from './target/target-controller';

const props = defineProps({
	sticker: {
		type: Object as PropType<StickerPlacement>,
		required: true,
	},
	controller: {
		type: Object as PropType<StickerTargetController | null>,
		default: null,
	},
	isClickable: {
		type: Boolean,
		default: true,
	},
	/**
	 * Wraps the sticker image in {@link AppAnimElectricity}.
	 */
	showCharged: {
		type: Boolean,
	},
});

const { sticker, controller, isClickable, showCharged } = toRefs(props);

const emit = defineEmits({
	click: () => true,
});

const refOuter = ref() as Ref<HTMLDivElement>;
const refLive = ref() as Ref<HTMLDivElement>;

const imgStyles = ref<CSSProperties>({});

const electricityProps = computed(() =>
	showCharged.value
		? {
				ignoreAssetPadding: true,
		  }
		: {}
);

const isLive = computed(() => controller.value?.isLive === true);

onMounted(() => {
	onUpdateStickerPlacement();

	if (isLive.value) {
		// Don't attach to the outer ref, since it may have an animation attached by its parent.
		refLive.value!.addEventListener(
			'animationend',
			_ => {
				if (controller.value) {
					removeStickerFromTarget(controller.value, sticker.value);
				}
			},
			true
		);
	}
});

watch(
	() => [sticker.value.position_x, sticker.value.position_y, sticker.value.rotation],
	onUpdateStickerPlacement
);

async function onUpdateStickerPlacement() {
	await nextTick();

	refOuter.value.style.left = `calc(${sticker.value.position_x * 100}% - 32px)`;
	refOuter.value.style.top = `calc(${sticker.value.position_y * 100}% - 32px)`;
	// Transform the inner element so the parent component can assign
	// translateY() while transitioning in.
	imgStyles.value = {
		transform: `rotate(${sticker.value.rotation * 90 - 45}deg)`,
	};
}

function onClickRemove() {
	if (isClickable.value) {
		emit('click');
	}
}
</script>

<template>
	<div ref="refOuter" class="_sticker" @click.stop="onClickRemove">
		<div
			ref="refLive"
			:class="{
				_live: isLive,
			}"
		>
			<component :is="showCharged ? AppAnimElectricity : 'div'" v-bind="electricityProps">
				<AppStickerImg
					:class="{
						_clickable: isClickable,
					}"
					:style="imgStyles"
					:src="sticker.sticker.img_url"
				/>
			</component>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-base-scale = scale(0.8)

._sticker
	position: absolute
	z-index: 2
	width: 64px
	height: 64px

	> *
	img
		display: block
		user-select: none
		width: 100%
		height: 100%

._live
	// Keep this at 0 or the image may flicker before removing itself.
	opacity: 0
	transform: $-base-scale
	animation-name: live-fade
	animation-duration: 8.5s
	animation-timing-function: $strong-ease-out

._clickable
	cursor: pointer

@keyframes live-fade
	0%
		opacity: 1
		transform: scale(1.2)

	10%
		opacity: 1
		transform: scale(1)

	60%
		opacity: 1
		transform: scale(1)

	100%
		opacity: 0
		transform: $-base-scale
</style>
