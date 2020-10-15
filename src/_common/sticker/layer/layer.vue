<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer" :class="{ '-dragging': drawer.isDragging }">
		<app-sticker-layer-placement-mask v-if="isShowingMask" :layer="layer" />
		<slot />
		<app-sticker-drawer />
	</div>
</template>

<style lang="stylus" scoped>
.-dragging
	cursor: grabbing !important
</style>
