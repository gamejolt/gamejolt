<template>
	<app-scroll-scroller
		id="shell-sidebar"
		class="shell-pane shell-pane-left"
		:class="{ '-lighter': visibleLeftPane === 'context' }"
		thin
	>
		<app-shortkey shortkey="c" @press="toggleLeftPane('chat')" />
		<app-shortkey shortkey="m" @press="toggleLeftPane('library')" />
		<app-shortkey shortkey="y" @press="toggleLeftPane('context')" />

		<app-shell-sidebar-chat v-if="visibleLeftPane === 'chat'" />
		<app-shell-sidebar-library v-if="visibleLeftPane === 'library'" />
		<!-- JODO: Move context sidebar into below context component -->
		<!-- <app-shell-sidebar-context v-if="visibleLeftPane === 'context'" /> -->
		<!-- JODO:
			Store the sidebar context information in a new SidebarStore,
			swapping out the props and component depending on the route information.
		-->
		<!-- <component :is="sidebarComponent" v-bind="sidebarProps" /> -->
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

#shell-sidebar
	display: flex
	flex-direction: column

	&.-lighter
		background-color: var(--theme-bg-offset)

	hr
		margin: $line-height-computed 15px

	.tag
		margin-top: 15px

	.alert
		border-radius: 0

.-content
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	padding: $line-height-computed 0
</style>

<script lang="ts" src="./sidebar"></script>
