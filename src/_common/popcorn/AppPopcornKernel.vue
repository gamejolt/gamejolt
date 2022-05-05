<script lang="ts">
import { onMounted } from '@vue/runtime-core';
import { onBeforeUnmount, PropType, ref, toRaw, toRef } from 'vue';
import { arrayRemove } from '../../utils/array';
import { KernelRecipeBase, usePopcornKettleController } from './popcorn-kettle-controller';

export type PopcornKernelData = KernelRecipeBase & {
	key: any;
	kernelImage: string;
	rotationVelocity: number;
};
</script>

<script lang="ts" setup>
const props = defineProps({
	kernelData: {
		type: Object as PropType<PopcornKernelData>,
		required: true,
	},
});

const data = toRef(props, 'kernelData');
const c = usePopcornKettleController()!;

const startTime = Date.now();
const endTime = startTime + data.value.duration;

const styleData = ref({
	opacity: 0,
	scale: 1,
	rotation: 0,
	offsetX: 0,
	offsetY: 0,
});

onMounted(() => c.kernelFrameCallbacks.value.push(calcData));

onBeforeUnmount(() => arrayRemove(c.kernelFrameCallbacks.value, i => toRaw(i) === toRaw(calcData)));

function calcData() {
	const { downwardGravityStrength, velocity, popAngle, rotationVelocity } = data.value;

	const now = Date.now();
	const dateVal = (now - startTime) / (endTime - startTime);
	const animLerp = Math.max(0, Math.min(1, dateVal));

	const _gravity = downwardGravityStrength;
	const _timeAdjusted = animLerp * velocity;
	const _velocity = velocity;
	const _angle = popAngle;

	const _radians = (_angle * Math.PI) / 180;

	const _hVelocity = _velocity * Math.cos(_radians);
	const _vVelocity = _velocity * Math.sin(_radians);

	const _verticalPosition =
		_vVelocity * _timeAdjusted + (1 / 2) * _gravity * Math.pow(_timeAdjusted, 2);

	let { opacity, scale, rotation, offsetX, offsetY } = styleData.value;

	if (data.value.reverse) {
		const _fadeInStop = 0.7;
		const _fadeOutStart = 0.2;
		var val = animLerp;

		if (_fadeInStop < val) {
			val = (-_fadeInStop + val) / (1 - _fadeInStop);
		} else if (val < _fadeOutStart) {
			val = (_fadeOutStart - val) / _fadeOutStart;
		} else {
			val = 0;
		}

		opacity = Math.max(0, Math.min(1, 1 * (1 - val) + 0 * val));
	} else {
		opacity = 1 - animLerp;
	}
	scale = Math.max(0, Math.min(1, 1 * (1 - animLerp) + 0.5 * animLerp));
	rotation = rotationVelocity * animLerp;
	rotation = (rotation * 180) / Math.PI;

	offsetY = _verticalPosition;
	offsetX = _hVelocity * _timeAdjusted;

	styleData.value = {
		opacity,
		scale,
		rotation,
		offsetX,
		offsetY,
	};
}
</script>

<template>
	<div
		class="-popcorn-kernel"
		:style="{
			transform: `translate3d(${styleData.offsetX}px, ${styleData.offsetY}px, 0) scale(${styleData.scale})`,
		}"
	>
		<img
			:src="data.kernelImage"
			alt=""
			draggable="false"
			:style="{
				width: data.baseSize + 'px',
				height: data.baseSize + 'px',
				opacity: styleData.opacity,
				transform: `rotate(${styleData.rotation}deg)`,
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.-popcorn-kernel
	opacity: 0
	animation: anim-opacity 200ms both

@keyframes anim-opacity
	0%
		opacity: 0

	100%
		opacity: 1
</style>
