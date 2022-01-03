<script lang="ts" src="./reactions"></script>

<template>
	<div
		v-app-tooltip="$gettext(`View Stickers`)"
		class="sticker-reactions"
		:class="{ '-active': controller.shouldShow }"
		@click.stop="onClick"
	>
		<app-sticker-reactions-item
			v-for="{ stickerId, imgUrl, count } of reactions"
			:key="stickerId"
			:img-url="imgUrl"
			:count="count"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.sticker-reactions
	display: inline-flex
	flex-wrap: wrap
	margin: 4px 0 8px 0
	cursor: pointer
	border: $border-width-small solid transparent

	&:hover
		rounded-corners()
		background-color: var(--theme-bg-offset)

.-active
	rounded-corners()
	background-color: var(--theme-bg-offset)
	border-color: var(--theme-backlight)
</style>
