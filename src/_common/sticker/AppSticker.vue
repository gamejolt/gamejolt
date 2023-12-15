<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import AppAnimElectricity from '../animation/AppAnimElectricity.vue';
import { ComponentProps } from '../component-helpers';
import AppStickerImg from './AppStickerImg.vue';
import { StickerPlacementModel } from './placement/placement.model';
import { removeStickerFromTarget, StickerTargetController } from './target/target-controller';

const props = defineProps({
	sticker: {
		type: Object as PropType<StickerPlacementModel>,
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

const size = 64;

const electricityProps = computed(
	() =>
		(showCharged.value
			? {
					ignoreAssetPadding: true,
			  }
			: {}) satisfies ComponentProps<typeof AppAnimElectricity>
);

const isLive = computed(() => controller.value?.isLive === true);

function onLiveAnimationEnd() {
	if (controller.value) {
		removeStickerFromTarget(controller.value, sticker.value);
	}
}

function onClickRemove() {
	if (isClickable.value) {
		emit('click');
	}
}
</script>

<template>
	<div
		class="-sticker"
		:style="{
			position: `absolute`,
			zIndex: 2,
			left: `calc(${sticker.position_x * 100}% - 32px)`,
			top: `calc(${sticker.position_y * 100}% - 32px)`,
			width: `${size}px`,
			height: `${size}px`,
		}"
		@click.stop="onClickRemove"
	>
		<div
			:class="{
				'-live': isLive,
			}"
			@animationend="onLiveAnimationEnd()"
		>
			<component :is="showCharged ? AppAnimElectricity : 'div'" v-bind="electricityProps">
				<AppStickerImg
					:size="size"
					:style="[
						{
							transform: `rotate(${sticker.rotation * 90 - 45}deg)`,
						},
						styleWhen(isClickable, {
							cursor: `pointer`,
						}),
					]"
					:src="sticker.sticker.img_url"
					:alt="sticker.sticker.name || ''"
				/>
			</component>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-base-scale = scale(0.8)

.-live
	// Keep this at 0 or the image may flicker before removing itself.
	opacity: 0
	transform: $-base-scale
	animation-name: live-fade
	animation-duration: 8.5s
	animation-timing-function: $strong-ease-out

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
