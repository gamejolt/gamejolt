<template>
	<div v-if="community">
		<app-scroll-scroller thin class="-sidebar fill-darker">
			<div class="-card">
				<app-community-card :community="community" />
			</div>

			<app-communities-view-overview-nav
				v-if="!isEditing"
				class="-nav"
				:community="community"
				:active-channel-title="channel"
			/>
			<!--
				We put some extra spacing in here because of the affixed header
				nav.
			-->
			<app-scroll-affix v-else :scroll-offset="80" :disabled="!Screen.isLg">
				<app-communities-view-overview-nav-edit class="-nav" :community="community" />
			</app-scroll-affix>
		</app-scroll-scroller>

		<div class="-content fill-backdrop">
			<router-view :community="community" :is-editing="isEditing" :sidebar-data="sidebarData" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../../../components/community/channel/card/variables'

$-sidebar-padding = 12px
$-sidebar-width = $card-width + $-sidebar-padding * 2

.-sidebar
	position: fixed
	left: $shell-cbar-width
	top: $shell-top-nav-height
	bottom: 0
	width: $-sidebar-width + $-sidebar-padding - 4px
	padding: $-sidebar-padding

.-content
	padding-left: $-sidebar-width
	min-height: 'calc(100vh - %s)' % $shell-top-nav-height
</style>

<script lang="ts" src="./view"></script>
