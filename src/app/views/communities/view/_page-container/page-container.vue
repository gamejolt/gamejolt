<template>
	<div class="-container">
		<div v-if="Screen.isLg" class="-offset" />
		<div class="-content">
			<slot />
		</div>
		<div v-if="shouldShowSidebar" class="-sidebar" :class="{ '-none': !sidebarHasContent }">
			<slot name="sidebar" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../variables'

.-container
	display: flex
	justify-content: center
	padding: ($grid-gutter-width / 2) 0

.-content, .-sidebar
	margin-left: ($grid-gutter-width-xs / 2)
	margin-right: ($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-left: ($grid-gutter-width / 2)
		margin-right: ($grid-gutter-width / 2)

.-offset
	flex: 1
	// Roughly how much offset we need to center the content to the search bar.
	max-width: 40px
	// Hiding from the element selector, not needed otherwise.
	z-index: -1

	// Prevent shifting when v-if="Screen.isSize" removes the element.
	@media $media-md-down
		display: none

.-content
	// Need a flex-basis the same as the max-width so we collapse .-offset first.
	flex: 2 1 620px
	max-width: 620px
	min-width: 0

	@media $media-xs
		max-width: none
		flex-basis: none

.-sidebar
	// Need a flex-basis the same as the max-width so we collapse .-offset first.
	flex: 1 2 $sidebar-width
	max-width: $sidebar-width

	&.-none
		// Shrink at a very high number so that .-content doesn't shrink.
		flex-shrink: 1000
</style>

<script lang="ts" src="./page-container"></script>
