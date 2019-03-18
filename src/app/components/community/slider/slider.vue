<template>
	<div class="-list" v-if="communities.length">
		<app-community-slider-item
			v-for="community of communities"
			:key="community.id"
			:community="community"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-list
	full-bleed()
	white-space: nowrap
	padding-left: $grid-gutter-width-xs * 0.5
	padding-right: $grid-gutter-width-xs * 0.5
	overflow-x: auto
	overflow-y: hidden
	margin-bottom: $line-height-computed

	@media $media-sm-up
		padding-left: $grid-gutter-width * 0.5
		padding-right: $grid-gutter-width * 0.5
</style>

<script lang="ts" src="./slider" />
