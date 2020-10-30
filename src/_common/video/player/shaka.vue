<script lang="ts" src="./shaka"></script>

<template>
	<div class="-shaka">
		<video ref="video" :poster="player.poster" :autoplay="shouldAutoplay" loop playsinline />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

>>> video
	display: block
	width: 100%
	height: 100%
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
</style>
