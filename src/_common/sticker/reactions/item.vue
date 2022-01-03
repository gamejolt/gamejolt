<script lang="ts" src="./item"></script>

<template>
	<div class="-item">
		<span class="-sticker">
			<img :src="imgUrl" @dragstart.prevent />
		</span>
		<span class="-count">
			{{ displayCount }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	rounded-corners()
	background-color: var(--theme-bg-offset)
	display: inline-flex
	align-items: center
	padding: 0px 4px
	margin: 2px 4px 2px 0
	user-select: none

	&:last-child
		margin-right: 0

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
