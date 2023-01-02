<script lang="ts">
import { uuidv4 } from '../../utils/uuid';
import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';

const path = `M53.3957 2.95826L96.8717 34.5455C98.4282 35.6763 99.0795 37.6808 98.485 39.5106L81.8786 90.6198C81.2841 92.4496 79.579 93.6884 77.655 93.6884H23.9157C21.9917 93.6884 20.2866 92.4496 19.692 90.6198L3.08566 39.5106C2.49112 37.6808 3.14243 35.6763 4.69894 34.5455L48.175 2.95826C49.7315 1.82739 51.8392 1.82739 53.3957 2.95826Z`;
const viewboxWidth = 101;
const viewboxHeight = 96;
</script>

<script lang="ts" setup>
defineProps({
	active: {
		type: Boolean,
	},
});

const uniqueId = uuidv4();
</script>

<template>
	<div style="position: relative">
		<AppAspectRatio :ratio="1" show-overflow>
			<div class="-container -rotate">
				<div class="-above">
					<slot name="above" />
				</div>

				<div
					class="-content"
					:style="{
						'clip-path': `url(#path-${uniqueId})`,
						overflow: 'hidden',
					}"
				>
					<slot />
				</div>

				<svg
					class="-border"
					:viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`"
					fill="none"
					:filter="active ? `url(#glow-${uniqueId})` : undefined"
				>
					<path class="-border-path" :class="{ '-active': active }" :d="path" />
				</svg>
			</div>

			<!--
			We have to scale the path data to the size of the viewport. We do that
			through the transform.
			http://meyerweb.com/eric/thoughts/2017/02/24/scaling-svg-clipping-paths-for-css-use/
			-->
			<svg height="0" width="0" :viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`">
				<defs>
					<clipPath
						:id="`path-${uniqueId}`"
						clipPathUnits="objectBoundingBox"
						:transform="`scale(${1 / 101} ${1 / 96})`"
					>
						<path :d="path" />
					</clipPath>

					<filter :id="`glow-${uniqueId}`">
						<feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>
			</svg>
		</AppAspectRatio>
	</div>
</template>

<style lang="stylus" scoped>
$-rotate-value = -6.2deg
$-rotate = rotate($-rotate-value)

.-container
	position: relative
	width: 100%
	height: 100%
	display: flex
	align-items: center
	justify-content: center

.-rotate
	transform: $-rotate

.-above
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	z-index: 2

.-border
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
	z-index: 1

	&-path
		stroke: var(--theme-bg-subtle)
		stroke-width: 6px

		&.-active
			stroke: var(--theme-link)

.-content
	display: flex
	align-items: center
	justify-content: center
	width: 97%
	height: 97%
	background: var(--theme-bg-offset)
</style>
