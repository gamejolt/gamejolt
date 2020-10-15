<script lang="ts" src="./item"></script>

<template>
	<div class="-item">
		<span class="-sticker">
			<img :src="sticker.img_url" @dragstart.prevent />
		</span>
		<span class="-count">
			{{ displayCount }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-item
	rounded-corners()
	border: $border-width-base solid
	border-color: var(--theme-bg-subtle)
	background-color: var(--theme-bg-offset)
	display: inline-flex
	align-items: center
	padding: 0px 4px
	margin-right: 8px
	margin-bottom: 4px
	user-select: none

.-sticker
	width: 20px
	height: 20px

	& > img
		display: block
		width: 100%
		height: 100%

.-count
	font-size: $font-size-tiny
	margin: 0 4px
</style>
