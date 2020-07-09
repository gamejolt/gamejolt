<template>
	<div>
		<!-- JODO: Move this into a shared component with cbar for better context transitions and zindexing -->
		<!-- Remove the wrapping ref - only needed for this testing usage -->
		<div ref="sidebar">
			<app-scroll-scroller
				id="shell-context-pane"
				class="content-with-sidebar--sidebar fill-offset"
				:class="{ '-visible': isShowingSidebar }"
				thin
			>
				<slot v-if="isShowingSidebar" name="sidebar" />
			</app-scroll-scroller>
		</div>
		<!-- </div> -->
		<div class="content-with-sidebar--content fill-backdrop">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

// JODO: Will probably want to replace all '.content-with-sidebar--sidebar' cases with the shell id
// depends on new component structure.
#shell-context-pane
	position: fixed
	top: $shell-top-nav-height
	bottom: 0
	width: $shell-content-sidebar-width
	padding: $shell-content-sidebar-padding
	z-index: $zindex-shell-pane-under
	transform: translateX(-($shell-content-sidebar-width))
	transition: transform 300ms $weak-ease-out

	&.-visible
		transform: translateX(0)

.content-with-sidebar--content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	@media $media-lg
		padding-left: $shell-content-sidebar-width
</style>

<script lang="ts" src="./content-with-sidebar"></script>
