<script lang="ts">
import { computed, onBeforeUnmount, onMounted, PropType, ref, toRaw, toRefs } from 'vue';
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

const canShow = computed(
	() => !!kernelData.value.kernelImage || !!kernelData.value.kernelComponent
);

onMounted(() => kernelFrameCallbacks.value.push(calcData));

onBeforeUnmount(() => arrayRemove(kernelFrameCallbacks.value, i => toRaw(i) === toRaw(calcData)));

function lerp(a: number, b: number, t: number) {
	return a * (1.0 - t) + b * t;
}

function inverseLerp(a: number, b: number, val: number) {
	return (val - a) / (b - a);
}

function calcData() {
	if (!canShow.value) {
		return;
	}

	const {
		downwardGravityStrength,
		velocity,
		popAngle,
		rotationVelocity,
		reverse,
		fadeInStop,
		fadeOutStart,
		fadeOut,
	} = kernelData.value;

	const now = Date.now();
	const dateVal = (now - startTime) / (endTime - startTime);
	let animVal = Math.max(0, Math.min(1, dateVal));
	var opacityVal = animVal;
	if (reverse) {
		animVal = 1 - animVal;
	}

	const _gravity = downwardGravityStrength;
	const _timeAdjusted = animVal * velocity;
	const _velocity = velocity;
	const _angle = popAngle;

	const _radians = (_angle * Math.PI) / 180;

	const _hVelocity = _velocity * Math.cos(_radians);
	const _vVelocity = _velocity * Math.sin(_radians);

	const _verticalPosition =
		_vVelocity * _timeAdjusted + (1 / 2) * _gravity * Math.pow(_timeAdjusted, 2);

	let { opacity, scale, rotation, offsetX, offsetY } = styleData.value;

	if (fadeInStop > opacityVal) {
		opacityVal = opacityVal / fadeInStop;
	} else if (fadeOut && opacityVal > fadeOutStart) {
		opacityVal = Math.abs(1 - inverseLerp(fadeOutStart, 1, opacityVal));
	} else {
		opacityVal = 1;
	}

	opacity = Math.max(0, Math.min(1, opacityVal));

	scale = Math.max(0, Math.min(1, lerp(1, 0.5, animVal)));
	rotation = rotationVelocity * animVal;
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
		v-if="canShow"
		class="popcorn-kernel"
		:class="{ '-kernel-forward': kernelData.useClassFadeIn }"
		:style="{
			transform: `translate3d(${styleData.offsetX}px, ${styleData.offsetY}px, 0) scale(${styleData.scale})`,
		}"
	>
		<img
			v-if="kernelData.kernelImage"
			:src="kernelData.kernelImage"
			alt=""
			draggable="false"
			:style="{
				width: `${kernelData.baseSize}px`,
				height: `${kernelData.baseSize}px`,
				opacity: styleData.opacity,
				transform: `rotate(${styleData.rotation}deg)`,
			}"
		/>
		<div
			v-else
			draggable="false"
			class="-custom-kernel-wrapper"
			:style="[
				{
					width: `${kernelData.baseSize}px`,
					height: `${kernelData.baseSize}px`,
					opacity: styleData.opacity,
					transform: `rotate(${styleData.rotation}deg)`,
				},
				`--jolticon-size: ${kernelData.baseSize * 0.75}px`,
			]"
		>
			<component
				:is="kernelData.kernelComponent"
				v-bind="kernelData.kernelComponentProps"
				:style="{
					maxWidth: '100%',
					maxHeight: '100%',
				}"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.popcorn-kernel
	&.-kernel-forward
		opacity: 0
		animation: anim-opacity 200ms both

.-custom-kernel-wrapper
	--jolticon-size: 24px

	::v-deep(.jolticon)
		font-size: var(--jolticon-size)
		margin: 0
		vertical-align: middle

@keyframes anim-opacity
	0%
		opacity: 0

	100%
		opacity: 1
</style>
