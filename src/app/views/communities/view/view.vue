<template>
	<div v-if="community">
		<app-scroll-scroller v-if="Screen.isLg" thin class="-channel-sidebar fill-offset">
			<div class="-card">
				<app-communities-view-card :community="community" />
			</div>

			<app-communities-view-nav v-if="!isEditing" />
			<app-communities-view-nav-edit v-else />
		</app-scroll-scroller>

		<div class="-content fill-backdrop">
			<router-view />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require './variables'

.-channel-sidebar
	position: fixed
	top: $shell-top-nav-height
	bottom: 0
	width: $sidebar-width
	padding: $sidebar-padding

	#shell.has-cbar &
		left: $shell-cbar-width

	#shell.has-banner &
		top: $shell-top-nav-height * 2

	// Prevent shifting when v-if="Screen.isSize" removes the element.
	@media $media-md-down
		display: none

.-content
	// Make it full-size height at least, so that the footer doesn't cut things off weird.
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	@media $media-lg
		padding-left: $sidebar-width
</style>

<script lang="ts" src="./view"></script>
