<template>
	<div v-if="community" class="-page">
		<app-scroll-scroller thin class="-channel-sidebar fill-offset" v-if="Screen.isLg">
			<div class="-card">
				<app-community-card :community="community" />
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
@require '../../../components/community/channel/card/variables'

$-sidebar-padding = 12px
$-sidebar-width = $card-width + $-sidebar-padding * 2

.-page
	--route-communities-view-sidebar-width: $-sidebar-width

.-channel-sidebar
	position: fixed
	left: $shell-cbar-width
	top: $shell-top-nav-height
	bottom: 0
	width: $-sidebar-width
	padding: $-sidebar-padding

	@media $media-md-down // prevent shifting when v-if="Screen.isSize" removes the element
		display: none

.-content
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height

	@media $media-lg
		padding-left: $-sidebar-width
</style>

<script lang="ts" src="./view"></script>
