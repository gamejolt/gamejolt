<template>
	<div v-if="community" class="-page">
		<app-scroll-scroller thin class="-sidebar fill-offset">
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

.-sidebar
	position: fixed
	left: $shell-cbar-width
	top: $shell-top-nav-height
	bottom: 0
	width: $-sidebar-width
	padding: $-sidebar-padding

.-content
	padding-left: $-sidebar-width
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height
</style>

<script lang="ts" src="./view"></script>
