<script lang="ts" src="./sticker"></script>

<template>
	<div ref="outer" class="-sticker" @click.stop="onClickRemove">
		<img
			ref="inner"
			draggable="false"
			onmousedown="return false"
			style="user-drag: none"
			:src="sticker.sticker.img_url"
			:class="{
				'-live': isLive,
				'-clickable': isClickable,
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-sticker
	position: absolute
	z-index: 2
	width: 64px
	height: 64px

	& > img
		display: block
		user-select: none
		width: 100%
		height: 100%

.-live
	// Keep this at 0 or the image may flicker before removing itself.
	opacity: 0
	animation-name: live-fade
	animation-duration: 2s
	animation-timing-function: $strong-ease-out

.-clickable
	cursor: pointer

@keyframes live-fade
	0%
		opacity: 1

	40%
		opacity: 0.8

	100%
		opacity: 0
</style>
