<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer" :class="{ '-dragging': drawer.isDragging }">
		<app-sticker-layer-placement-mask
			v-if="isShowingMask"
			class="-placement-mask"
			:layer="layer"
		/>
		<slot />
		<app-sticker-drawer-ghost v-if="isShowingMask && drawer.sticker" class="-ghost" />
		<app-sticker-drawer v-if="isActiveLayer" class="-sticker-drawer" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-layer
	min-height: 100vh

.-placement-mask
	z-index: $zindex-sticker-layer-mask

.-ghost
	// top and left get assigned through a DrawerStore callback.
	position: absolute
	z-index: $zindex-sticker-layer-mask + 1

.-sticker-drawer
	z-index: $zindex-sticker-layer-mask + 2

.-dragging
	cursor: grabbing !important

	.-ghost
		z-index: $zindex-sticker-layer-mask + 3
</style>
