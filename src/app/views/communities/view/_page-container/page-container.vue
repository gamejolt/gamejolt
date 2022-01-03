<script lang="ts" src="./page-container"></script>

<template>
	<div class="-container">
		<div v-if="Screen.isLg && !full" class="-offset" />
		<div
			class="-content"
			:class="{ '-single': !sidebarHasContent, '-full': full && !sidebarHasContent }"
		>
			<div :class="{ container: full && !sidebarHasContent }">
				<slot />
			</div>
		</div>
		<div
			v-if="shouldShowSidebar"
			class="-sidebar"
			:class="{ '-empty': !sidebarHasContent, '-none': full && !sidebarHasContent }"
		>
			<slot name="sidebar" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-offset-width = 110px
$-content-width = 650px
// Subtracting 31px gives us the exact content
// width we previously had on all breakpoints.
$-content-basis = $-content-width - $-offset-width - 31px
$-sidebar-width = 365px
$-sidebar-basis = $-sidebar-width - $-offset-width

.-container
	display: flex
	justify-content: center
	padding: ($grid-gutter-width / 2) 0

.-content
.-sidebar
	&:not(.-full)
		margin-left: ($grid-gutter-width-xs / 2)
		margin-right: ($grid-gutter-width-xs / 2)

		@media $media-sm-up
			margin-left: ($grid-gutter-width / 2)
			margin-right: ($grid-gutter-width / 2)

.-offset
	flex: 1
	// Roughly how much offset we need to center the content to the search bar.
	max-width: $-offset-width
	// Hiding from the element selector, not needed otherwise.
	z-index: -1

	// Prevent shifting when v-if="Screen.isSize" removes the element.
	@media $media-md-down
		display: none

.-content
	// Need a flex-basis the same as the max-width so we collapse .-offset first.
	flex: 2 1 $-content-basis
	max-width: $-content-width
	min-width: 0

	&.-single
		flex-basis: 100%

		&.-full
			max-width: none

			@media $media-xs
				margin-left: 0
				margin-right: 0

	@media $media-xs
		max-width: none

.-sidebar
	// Need a flex-basis the same as the max-width so we collapse .-offset first.
	flex: 1 2 $-sidebar-basis
	max-width: $-sidebar-width
	min-width: 0

	&.-empty
		// Shrink at a very high number so that .-content doesn't shrink.
		flex-shrink: 1000

		&.-none
			margin: 0
</style>
