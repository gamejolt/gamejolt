<template>
	<div class="-app-img-backdrop">
		<div class="-bg-color-styling" :style="wrapperStyling" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-app-img-backdrop
	position: relative
	width: inherit
	height: 100%

	img
		position: relative

.-bg-color-styling
	position: absolute
	width: 100%
	height: 100%
	background-clip: content-box
</style>

<script lang="ts" src="./backdrop"></script>
