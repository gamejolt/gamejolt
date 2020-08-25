<template>
	<div>
		<app-scroll-scroller
			v-if="isShowingSidebar"
			thin
			class="content-with-sidebar--sidebar fill-offset"
		>
			<slot name="sidebar" />
		</app-scroll-scroller>
		<div class="content-with-sidebar--content fill-backdrop">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.content-with-sidebar--sidebar
	position: fixed
	top: $shell-top-nav-height
	bottom: 0
	width: $shell-content-sidebar-width
	padding: $shell-content-sidebar-padding

	// Prevent shifting when v-if="Screen.isSize" removes the element.
	@media $media-md-down
		display: none

.content-with-sidebar--content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	@media $media-lg
		padding-left: $shell-content-sidebar-width
</style>

<script lang="ts" src="./content-with-sidebar"></script>
