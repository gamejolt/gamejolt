<template>
	<div class="-list" v-if="communities.length || withAddButton">
		<app-community-slider-item
			v-for="community of communities"
			:key="community.id"
			:community="community"
			:event-cat="eventCat"
		/>

		<app-community-add-widget
			v-if="withAddButton"
			class="-add"
			v-app-tooltip.bottom="$gettext(`Create a Community`)"
			:size="addButtonSize"
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

.-add
	display: inline-block
	vertical-align: middle
	margin-top: 2px

	// Needed to counteract the height of the label the add button does not have.
	@media $media-md-up
		vertical-align: top
</style>

<script lang="ts" src="./slider"></script>
