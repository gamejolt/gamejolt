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
@import '~styles/variables'
@import '~styles-lib/mixins'

.sticker-reactions
	display: inline-flex
	flex-wrap: wrap
	margin: 4px -4px 8px -4px
	cursor: pointer

	&:hover
		rounded-corners()
		background-color: var(--theme-bg-offset)

.-active
	rounded-corners()
	background-color: var(--theme-bg-offset)
</style>
