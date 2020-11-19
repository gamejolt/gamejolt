<script lang="ts" src="./_flashlight"></script>

<template>
	<div
		v-if="visible"
		class="-dark-mode"
		:style="{
			left: `${x}px`,
			top: `${y}px`,
		}"
	>
		<img id="flashlight" class="-flashlight" src="./light.png" />
	</div>
</template>

<style lang="stylus" scoped>
.-dark-mode
	position: absolute
	height: 400px
	width: 400px
	border-radius: 50%
	box-shadow: 0 0 0 9999px rgba(0, 0, 0, 1)
	z-index: 2000
	pointer-events: none
</style>
