<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer" :class="{ '-dragging': drawer.isDragging }">
		<app-sticker-layer-placement-mask
			v-if="isShowingMask"
			class="-placement-mask"
			:layer="layer"
		/>
		<slot />
		<app-sticker-drawer class="-sticker-drawer" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-layer
	min-height: 100vh

.-placement-mask
	z-index: $zindex-sticker-layer-mask

.-sticker-drawer
	z-index: $zindex-sticker-layer-mask + 1

.-dragging
	cursor: grabbing !important
</style>
