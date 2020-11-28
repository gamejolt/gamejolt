<script lang="ts" src="./placement-mask"></script>

<template>
	<!--
	We set the keys below to the "viewbox" so that we recalculate all the
	sticker targets/masks every time dimensions for the page change. Chances are
	that new content has loaded in or shifted the targets around.
	-->
	<div
		v-app-observe-dimensions="onDimensionsChange"
		class="-container"
		:class="{ '-dragging': drawer.isDragging }"
	>
		<div class="-overlay" @click.stop="onClickMask">
			<svg v-if="width > 0" :viewBox="viewbox" xmlns="http://www.w3.org/2000/svg">
				<!--
				This creates a mask that we use to punch out the targets from the
				black overlay.
				-->
				<mask id="myMask">
					<rect x="0" y="0" :width="width" :height="height" fill="white" />
					<template v-if="hasCalculated">
						<app-sticker-layer-placement-mask-item
							v-for="(target, i) of layer.targets"
							:key="`${viewbox}-${i}`"
							:target="target"
							:layer="layer"
						/>
					</template>
				</mask>

				<rect
					x="0"
					y="0"
					:width="width"
					:height="height"
					mask="url(#myMask)"
					fill="#888"
					opacity="0.5"
				/>
			</svg>

			<template v-if="hasCalculated">
				<app-sticker-layer-placement-mask-target
					v-for="(target, i) of layer.targets"
					:key="`${viewbox}-${i}`"
					:target="target"
					:layer="layer"
				/>
			</template>
		</div>

		<app-sticker-layer-drawer class="-drawer" />
		<app-sticker-layer-ghost v-if="drawer.sticker" class="-ghost" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-container
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	overflow: hidden

.-dragging
	cursor: grabbing !important

	.-ghost
		z-index: 4

.-overlay
	z-index: 1

.-ghost
	z-index: 2

.-drawer
	z-index: 3
</style>
