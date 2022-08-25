<script lang="ts" setup>
const bean1Path = `M474.117 0.00164546C440.378 0.230874 399.077 24.3772 395.372 53.2712C390.515 91.1562 434.151 94.9785 447.427 103.513C460.704 112.048 475.112 125.826 498.74 118.705C534.693 107.868 535.838 26.2776 499.687 5.85515C492.417 1.74837 483.563 -0.0625347 474.117 0.00164546ZM99.2944 72.4801C89.5244 72.5766 78.989 74.286 67.0971 78.1071C-71.1245 122.521 10.467 410.786 254.288 445.08C410.825 467.097 605.275 360.162 590.111 235.181C576.624 124.023 432.622 141.706 327.251 137.279C190.101 131.516 159 71.8906 99.2944 72.4801Z`;
const bean1Width = 591;
const bean1Height = 448;

const bean1ForegroundPath = `M76 2.85513C66.23 2.95162 78.9888 71.286 67.0968 75.1071C-71.1248 119.521 10.4668 407.786 254.288 442.08C410.824 464.097 605.274 357.162 590.111 232.181C576.624 121.023 570 75.1071 542 2.85513C404.849 -2.9075 135.705 2.26554 76 2.85513Z`;
const bean1ForegroundWidth = 591;
const bean1ForegroundHeight = 445;

const bean2Path = `M255.843 0.00888161C102.677 1.44696 -32.7816 182.072 7.03408 273.382C57.3668 388.811 209.717 353.293 276.309 370.657C357.7 391.881 518.401 481.257 580.36 374.546C662.293 233.435 441.393 5.08325 263.149 0.0752754C260.71 0.00679033 258.274 -0.0139089 255.843 0.00888161ZM30.4267 350.48C24.9463 350.506 19.4031 351.707 13.788 354.569C-8.45387 365.906 -5.93206 414.447 37.2392 437.14C80.9842 460.134 136.739 443.367 143.708 416.278C152.12 383.579 113.373 383.67 86.9403 372.751C68.7491 365.237 49.9992 350.381 30.4267 350.48ZM218.011 381.349C208.48 381.337 198.059 383.719 188.954 388.663C164.993 401.674 163.605 429.485 175.938 436.007C199.268 448.343 249.476 424.968 248.048 400.626C247.31 388.05 233.895 381.37 218.011 381.349Z`;
const bean2Width = 598;
const bean2Height = 448;

const bean2ForegroundPath = `M7.03416 0.0752779C7.03407 110 7.03412 180 7.03406 273.382C57.3668 388.811 209.717 353.293 276.309 370.657C357.7 391.881 518.401 481.257 580.36 374.546C593.5 217 593.5 108 593.5 0.0752864C591.061 0.00680137 9.46538 0.0524873 7.03416 0.0752779Z`;
const bean2ForegroundWidth = 598;
const bean2ForegroundHeight = 448;

defineProps({
	variant: {
		type: Number,
		default: 1,
	},
	flip: {
		type: Boolean,
	},
});
</script>

<template>
	<div class="-content-col-img">
		<!--
		We have to scale the path data to the size of the viewport.
		We do that through the transform.
		http://meyerweb.com/eric/thoughts/2017/02/24/scaling-svg-clipping-paths-for-css-use/
		-->
		<template v-if="variant === 1">
			<svg class="-svg" height="0" width="0" :viewBox="`0 0 ${bean1Width} ${bean1Height}`">
				<defs>
					<clipPath
						id="-bean-1"
						clipPathUnits="objectBoundingBox"
						:transform="`scale(${1 / bean1Width} ${1 / bean1Height})`"
					>
						<path :d="bean1Path" />
					</clipPath>
				</defs>
			</svg>

			<svg
				class="-svg"
				height="0"
				width="0"
				:viewBox="`0 0 ${bean1ForegroundWidth} ${bean1ForegroundHeight}`"
			>
				<defs>
					<clipPath
						id="-bean-1-fg"
						clipPathUnits="objectBoundingBox"
						:transform="`scale(${1 / bean1ForegroundWidth} ${
							1 / bean1ForegroundHeight
						})`"
					>
						<path :d="bean1ForegroundPath" />
					</clipPath>
				</defs>
			</svg>
		</template>
		<template v-else-if="variant === 2">
			<svg class="-svg" height="0" width="0" :viewBox="`0 0 ${bean2Width} ${bean2Height}`">
				<defs>
					<clipPath
						id="-bean-2"
						clipPathUnits="objectBoundingBox"
						:transform="`scale(${1 / bean2Width} ${1 / bean2Height})`"
					>
						<path :d="bean2Path" />
					</clipPath>
				</defs>
			</svg>

			<svg
				class="-svg"
				height="0"
				width="0"
				:viewBox="`0 0 ${bean2ForegroundWidth} ${bean2ForegroundHeight}`"
			>
				<defs>
					<clipPath
						id="-bean-2-fg"
						clipPathUnits="objectBoundingBox"
						:transform="`scale(${1 / bean2ForegroundWidth} ${
							1 / bean2ForegroundHeight
						})`"
					>
						<path :d="bean2ForegroundPath" />
					</clipPath>
				</defs>
			</svg>
		</template>

		<div
			:style="{
				'clip-path': `url(#-bean-${variant})`,
				overflow: 'hidden',
				backgroundColor: 'var(--theme-bg-offset)',
				height: '100%',
				transform: flip ? 'scale(-1, 1)' : undefined,
			}"
		/>
		<div
			class="-bean-img-wrapper"
			:style="{
				'clip-path': `url(#-bean-${variant}-fg)`,
				overflow: 'hidden',
			}"
		>
			<div class="-bean-img-wrapper">
				<slot />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-content-col-img
	width: 100%
	height: 100%
	position: relative

.-bean-img-wrapper
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1
	display: flex
	justify-content: center
	align-items: center

	::v-deep(> *)
		max-width: 100%
		max-height: 100%

.-svg
	position: absolute
</style>
