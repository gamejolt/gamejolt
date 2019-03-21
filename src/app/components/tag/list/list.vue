<template>
	<app-scroll-scroller horizontal overlay>
		<div class="-list">
			<div class="-list-item" v-for="tag of tags" :key="tag.id">
				<app-tag-thumbnail class="-list-thumb" :tag="tag.id" />
			</div>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-list
	white-space: nowrap
	text-align: center
	padding-top: ($grid-gutter-width / 2)
	padding-bottom: ($grid-gutter-width / 2)

	@media $media-xs
		padding-top: ($grid-gutter-width-xs / 2)
		padding-bottom: ($grid-gutter-width-xs / 2)

	&-item
		display: inline-block
		width: 130px
		margin: 0 10px

	&-thumb
		margin-bottom: 0 !important
</style>

<script lang="ts" src="./list" />
