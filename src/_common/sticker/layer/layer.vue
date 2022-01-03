<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer" :class="{ '-dragging': drawer.isDragging }" @contextmenu="onContextMenu">
		<app-sticker-layer-placement-mask
			v-if="layer.isShowingDrawer"
			class="-placement-mask"
			:layer="layer"
		/>

		<!--
		I don't know why, but DO NOT PUT ELEMENTS AFTER THIS SLOT. For some
		reason vue was having a hard time not-rerendering everything on certain
		changes to drawer store.
		-->
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-placement-mask
	z-index: $zindex-sticker-layer
</style>
