<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer" :class="{ '-dragging': drawer.isDragging }" @contextmenu.prevent>
		<app-sticker-layer-placement-mask
			v-if="layer.isShowingDrawer"
			class="-placement-mask"
			:layer="layer"
		/>
		<app-sticker-drawer-ghost v-if="layer.isShowingDrawer && drawer.sticker" class="-ghost" />
		<app-sticker-drawer v-if="layer.isActive" class="-sticker-drawer" />

		<!--
		I don't know why, but DO NOT PUT ELEMENTS AFTER THIS SLOT. For some
		reason vue was having a hard time not-rerendering everything on certain
		changes to drawer store.
		-->
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-layer
	min-height: 100vh

.-placement-mask
	z-index: $zindex-sticker-layer

.-ghost
	// top and left get assigned through a DrawerStore callback.
	position: absolute
	z-index: $zindex-sticker-layer + 1

.-sticker-drawer
	z-index: $zindex-sticker-layer + 2

.-dragging
	cursor: grabbing !important

	.-ghost
		z-index: $zindex-sticker-layer + 3
</style>
