<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer" :class="{ '-dragging': drawer.isDragging }" @contextmenu="onContextMenu">
		<app-sticker-layer-placement-mask
			v-if="layer.isShowingDrawer"
			class="-placement-mask"
			:layer="layer"
		/>
		<template v-if="layer.isShowingDrawer">
			<app-sticker-drawer-ghost v-if="drawer.sticker" class="-ghost" />
			<app-sticker-drawer class="-sticker-drawer" />
		</template>

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
