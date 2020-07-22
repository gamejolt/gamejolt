<template>
	<div>
		<div
			class="content-with-sidebar--content fill-backdrop"
			:class="{ '-context-available': hasRouteContext }"
		>
			<slot />
		</div>
	</div>
</template>

<script lang="ts" src="./content-with-sidebar"></script>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.content-with-sidebar--content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	// We want to make room for the sidebar on large screens if the route has a contextPane available.
	// All other breakpoints should instead overlay their content.
	&.-context-available
		@media $media-lg
			padding-left: $shell-content-sidebar-width
</style>
