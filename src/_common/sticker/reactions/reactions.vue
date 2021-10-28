<script lang="ts" src="./reactions"></script>

<template>
	<div
		v-app-tooltip="controller.isLive ? null : $gettext(`View Stickers`)"
		class="sticker-reactions"
		:class="{
			'-active': showAsActive,
			'-live': controller.isLive,
		}"
		@click.stop="onClick"
	>
		<app-sticker-reactions-item
			v-for="{ stickerId, imgUrl, count } of reactions"
			:key="stickerId"
			:img-url="imgUrl"
			:count="count"
			:animate="shouldAnimate"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.sticker-reactions
	display: inline-flex
	flex-wrap: wrap
	margin: 4px 0 8px 0
	border: $border-width-small solid transparent

	&:not(.-live)
		cursor: pointer

		&:hover
			rounded-corners()
			background-color: var(--theme-bg-offset)

.-active
	rounded-corners()
	background-color: var(--theme-bg-offset)
	border-color: var(--theme-backlight)
</style>
