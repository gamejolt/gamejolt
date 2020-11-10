<script lang="ts" src="./sticker"></script>

<template>
	<div ref="outer" class="-sticker" @click.stop="onClick">
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
		<div v-if="shouldShowComment" class="-comment -clickable">
			<app-jolticon icon="comment" class="-icon" />
			<app-user-avatar-img class="-user" :user="commentUser" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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

	&:hover
		.-comment
			opacity: 1

.-clickable
	cursor: pointer

.-comment
	position: absolute
	right: 0
	bottom: 0
	filter: drop-shadow(1px 1px 0 white) drop-shadow(-1px 1px 0 white) drop-shadow(1px -1px 0 white) drop-shadow(-1px -1px 0 white)
	rounded-corners()
	opacity: 0.5
	transition: opacity 0.1s ease

.-icon
	font-size: $jolticon-size * 1.5
	color: var(--theme-dark)

.-user
	width: 14px
	height: 14px
	position: absolute
	top: 3px
	left: 7px
</style>
