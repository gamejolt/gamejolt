<template>
	<div class="-container">
		<div v-if="Screen.isLg" class="-offset"></div>
		<div class="-content">
			<slot />
		</div>
		<div v-if="Screen.isDesktop" class="-sidebar" :class="{ '-none': !sidebarHasContent }">
			<slot name="sidebar" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-gutter = $grid-gutter-width / 2

.-container
	display: flex
	justify-content: center
	padding: $grid-gutter-width 0

.-content, .-sidebar
	margin-left: $-gutter
	margin-right: $-gutter

.-offset
	flex: 1
	max-width: 40px // roughly how much offset we need to center on the search bar
	z-index: -1 // only included this to hide it from the element selector, not needed otherwise

	@media $media-md-down // prevent shifting when v-if="Screen.isSize" removes the element
		display: none

.-content
	// Need a flex-basis the same as the max-width so we collapse .-offset first
	flex: 2 1 650px
	max-width: 650px
	min-width: 0

.-sidebar
	// Need a flex-basis the same as the max-width so we collapse .-offset first
	flex: 1 2 var(--route-communities-view-sidebar-width)
	max-width: var(--route-communities-view-sidebar-width)

	&.-none
		// Shrink at a very high number so that .-content doesn't shrink.
		flex-shrink: 1000
</style>

<script lang="ts" src="./page-container"></script>
