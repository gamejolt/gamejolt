<script lang="ts" setup>
import { computed } from 'vue';

import AppAspectRatio from '../aspect-ratio/AppAspectRatio.vue';
import { beans } from './beans';

type Props = {
	variant?: 1 | 2;
	flip?: boolean;
	/**
	 * Removes the `max-width` and `max-height` from the default slot child.
	 */
	noClamp?: boolean;
	bgColor?: string;
};
const { variant = 1, flip, noClamp, bgColor = 'var(--theme-bg-offset)' } = defineProps<Props>();

const bean = computed(() => beans[variant - 1]);
</script>

<template>
	<div class="bean">
		<!--
		We have to scale the path data to the size of the viewport.
		We do that through the transform.
		http://meyerweb.com/eric/thoughts/2017/02/24/scaling-svg-clipping-paths-for-css-use/
		-->
		<svg height="0" width="0" :viewBox="`0 0 ${bean.bgWidth} ${bean.bgHeight}`">
			<defs>
				<clipPath
					:id="`-bean-${variant}`"
					clipPathUnits="objectBoundingBox"
					:transform="`scale(${1 / bean.bgWidth} ${1 / bean.bgHeight})`"
				>
					<path :d="bean.bgPath" />
				</clipPath>
			</defs>
		</svg>

		<svg height="0" width="0" :viewBox="`0 0 ${bean.fgWidth} ${bean.fgHeight}`">
			<defs>
				<clipPath
					:id="`-bean-${variant}-fg`"
					clipPathUnits="objectBoundingBox"
					:transform="`scale(${1 / bean.fgWidth} ${1 / bean.fgHeight})`"
				>
					<path :d="bean.fgPath" />
				</clipPath>
			</defs>
		</svg>

		<div
			class="-bg-container"
			:style="{
				clipPath: `url(#-bean-${variant})`,
				backgroundColor: bgColor,
				transform: flip ? 'scale(-1, 1)' : undefined,
			}"
		>
			<AppAspectRatio :ratio="bean.bgWidth / bean.bgHeight">
				<div class="-bg-stretch">
					<slot name="background" />
				</div>
			</AppAspectRatio>
		</div>

		<div
			class="-bean-img-wrapper"
			:class="{
				'-clamp-child': !noClamp,
			}"
			:style="{
				clipPath: `url(#-bean-${variant}-fg)`,
			}"
		>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.bean
	width: 100%
	position: relative

	svg
		position: absolute

.-bg-container
	overflow: hidden

.-bean-img-wrapper
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1
	overflow: hidden
	display: flex
	justify-content: center
	align-items: center

	&.-clamp-child
		::v-deep(> *)
			max-width: 100%
			max-height: 100%

.-bg-stretch
	&
	::v-deep(> *)
		width: 100%
		height: 100%
</style>
