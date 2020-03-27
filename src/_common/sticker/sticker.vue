<template>
	<div class="-sticker" ref="sticker" @click="onClickRemove">
		<img
			draggable="false"
			onmousedown="return false"
			style="user-drag: none"
			:src="sticker.sticker.img_url"
			:class="{
				'-sticker-removable': canRemove,
			}"
		/>
	</div>
</template>

<style lang="stylus" scoped>
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
		filter: drop-shadow(2px 2px 0 white) drop-shadow(-2px 2px 0 white) drop-shadow(2px -2px 0 white) drop-shadow(-2px -2px 0 white)

.-sticker-removable
	cursor: pointer
</style>

<script lang="ts" src="./sticker"></script>
