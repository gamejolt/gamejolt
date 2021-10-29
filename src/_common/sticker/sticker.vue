<script lang="ts" src="./sticker"></script>

<template>
	<div ref="outer" class="-sticker" @click.stop="onClickRemove">
		<div
			ref="live"
			:class="{
				'-live': isLive,
			}"
		>
			<img
				ref="inner"
				draggable="false"
				onmousedown="return false"
				style="user-drag: none"
				:src="sticker.sticker.img_url"
				:class="{
					'-clickable': isClickable,
				}"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

$-base-scale = scale(0.8)

.-sticker
	position: absolute
	z-index: 2
	width: 64px
	height: 64px

	> *
	img
		display: block
		user-select: none
		width: 100%
		height: 100%

.-live
	// Keep this at 0 or the image may flicker before removing itself.
	opacity: 0
	transform: $-base-scale
	animation-name: live-fade
	animation-duration: 8.5s
	animation-timing-function: $strong-ease-out

.-clickable
	cursor: pointer

@keyframes live-fade
	0%
		opacity: 1
		transform: scale(1.2)

	10%
		opacity: 1
		transform: scale(1)

	60%
		opacity: 1
		transform: scale(1)

	100%
		opacity: 0
		transform: $-base-scale
</style>
