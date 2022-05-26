<script lang="ts">
import { onBeforeUnmount, onMounted, PropType, ref, toRaw, toRefs } from 'vue';
import { arrayRemove } from '../../utils/array';
import { PopcornKernelData, usePopcornKettleController } from './popcorn-kettle-controller';
</script>

<script lang="ts" setup>
const props = defineProps({
	kernelData: {
		type: Object as PropType<PopcornKernelData>,
		required: true,
	},
});

const { kernelData } = toRefs(props);
const { kernelFrameCallbacks } = usePopcornKettleController()!;

const startTime = Date.now();
const endTime = startTime + kernelData.value.duration;

const styleData = ref({
	opacity: 0,
	scale: 1,
	rotation: 0,
	offsetX: 0,
	offsetY: 0,
});

onMounted(() => kernelFrameCallbacks.value.push(calcData));

onBeforeUnmount(() => arrayRemove(kernelFrameCallbacks.value, i => toRaw(i) === toRaw(calcData)));

function calcData() {
	const {
		downwardGravityStrength,
		velocity,
		popAngle,
		rotationVelocity,
		reverse,
		reverseFadeOut,
	} = kernelData.value;

	const now = Date.now();
	const dateVal = (now - startTime) / (endTime - startTime);
	let animLerp = Math.max(0, Math.min(1, dateVal));
	if (reverse) {
		animLerp = 1 - animLerp;
	}

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

	if (reverse) {
		const _fadeInStop = 0.7;
		const _fadeOutStart = reverseFadeOut ? 0.2 : 0;
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
		class="popcorn-kernel"
		:class="{ '-kernel-forward': !kernelData.reverse && kernelData.forwardFadeIn }"
		:style="{
			transform: `translate3d(${styleData.offsetX}px, ${styleData.offsetY}px, 0) scale(${styleData.scale})`,
		}"
	>
		<img
			:src="kernelData.kernelImage"
			alt=""
			draggable="false"
			:style="{
				width: kernelData.baseSize + 'px',
				height: kernelData.baseSize + 'px',
				opacity: styleData.opacity,
				transform: `rotate(${styleData.rotation}deg)`,
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.popcorn-kernel
	&.-kernel-forward
		opacity: 0
		animation: anim-opacity 200ms both

@keyframes anim-opacity
	0%
		opacity: 0

	100%
		opacity: 1
</style>
