<template>
	<div>
		<!-- JODO: Move this into a proper sidebar component -->
		<!-- Remove the ref - only needed for testing -->
		<div ref="sidebar" id="shell-context-pane" :class="{ '-visible': isShowingSidebar }">
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

#shell-context-pane
	&.-visible
		padding: $shell-content-sidebar-padding

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
