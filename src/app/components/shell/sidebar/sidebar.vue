<script lang="ts" src="./sidebar"></script>

<template>
	<app-scroll-scroller id="shell-sidebar" class="shell-pane shell-pane-left" thin>
		<app-shortkey v-if="user" shortkey="c" @press="toggleLeftPane('chat')" />
		<app-shortkey v-if="user || Screen.isXs" shortkey="m" @press="toggleLeftPane('library')" />
		<app-shortkey shortkey="y" @press="toggleLeftPane('context')" />

		<app-shell-sidebar-chat v-if="visibleLeftPane === 'chat'" />
		<app-shell-sidebar-library v-if="visibleLeftPane === 'library'" />
		<app-shell-sidebar-context v-if="visibleLeftPane === 'context'" />
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

#shell-sidebar
	display: flex
	flex-direction: column

	hr
		margin: $line-height-computed 15px

	.tag
		margin-top: 15px

	.alert
		border-radius: 0
</style>
