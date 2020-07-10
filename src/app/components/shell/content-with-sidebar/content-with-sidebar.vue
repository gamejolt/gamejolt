<template>
	<div>
		<!-- JODO: Move this into a shared component with cbar for better context transitions and zindexing -->
		<!-- Remove the ref - only needed for testing -->
		<div ref="sidebar" id="shell-context-pane">
			<slot v-if="isShowingSidebar" name="sidebar" />
		</div>
		<div
			class="content-with-sidebar--content fill-backdrop"
			:class="{ '-context-available': hasRouteContext }"
		>
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// JODO: Will probably want to replace all '.content-with-sidebar--sidebar' cases with the shell id
// depends on new component structure.
// JODO: We should consolidate left-pane items (chat, library, context)
// into one component that swaps out the content depending on store information.
#shell-context-pane
	padding: $shell-content-sidebar-padding
	// JODO: Remove all this - just keeping for reference if needed
	// position: fixed
	// top: $shell-top-nav-height
	// bottom: 0
	// width: $shell-content-sidebar-width
	// z-index: $zindex-shell-pane
	// transform: translateX(-($shell-content-sidebar-width))
	// transition: transform 300ms $weak-ease-out

	// #shell.left-pane-visible &, #shell.right-pane-visible &
	// 	z-index: $zindex-shell-pane-under

	// @media $media-lg
	// 	z-index: $zindex-shell-pane-under
	// 	transition: none

	// &.-visible
	// 	transform: translateX(0)

.content-with-sidebar--content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	// We want to make room for the sidebar on large screens if the route has a contextPane available.
	// All other breakpoints should instead overlay their content.
	&.-context-available
		@media $media-lg
			padding-left: $shell-content-sidebar-width
</style>

<script lang="ts" src="./content-with-sidebar"></script>
