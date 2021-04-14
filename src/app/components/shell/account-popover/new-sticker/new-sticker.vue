<script lang="ts" src="./new-sticker"></script>

<template>
	<div ref="newSticker" class="-new-sticker">
		<img class="-new-sticker-img" :src="stickerImg" />
	</div>
</template>

<style lang="stylus" scoped>
$-size = 32px

.-new-sticker
	position: fixed
	width: $-size
	height: $-size
	animation-name: anim
	animation-duration: 1.5s
	animation-iteration-count: 1
	animation-fill-mode: forwards
	animation-timing-function: ease-out
	z-index: 4
	user-select: none
	pointer-events: none

	&-img
		display: block
		width: $-size
		height: $-size

@keyframes anim
	0%
		transform: none
		opacity: 0.5

	50%
		transform: translateY(100px) scale(1.5)
		opacity: 1

	55%
		transform: translateY(100px) scale(1.7) rotateZ(-20deg)

	60%
		transform: translateY(100px) scale(1.9) rotateZ(20deg)

	65%
		transform: translateY(100px) scale(2.1) rotateZ(-20deg)

	70%
		transform: translateY(100px) scale(2.3) rotateZ(20deg)
		opacity: 1

	100%
		transform: translateY(0) scale(0)
		opacity: 0
</style>
