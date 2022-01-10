<script lang="ts" src="./volume-meter"></script>

<template>
	<div class="-volume-meter">
		<div class="-full" :style="{ width: volumePercent }" />
	</div>
</template>

<style lang="stylus" scoped>
.-volume-meter
	position: relative
	height: 7px
	background-color: black
	overflow-x: clip

	.-full
		position: absolute
		top: -2px
		left: -2px
		width: 0
		min-width: 5px
		height: calc(100% + 4px)
		change-bg('highlight')
		transition: width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
		will-change: width
</style>
