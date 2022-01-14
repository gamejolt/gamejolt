<script lang="ts" src="./sidebar"></script>

<template>
	<app-scroll-scroller id="shell-sidebar" class="shell-pane shell-pane-left" thin>
		<app-shortkey v-if="user" shortkey="c" @press="store.toggleLeftPane('chat')" />
		<app-shortkey
			v-if="user || Screen.isXs"
			shortkey="m"
			@press="store.toggleLeftPane('library')"
		/>
		<app-shortkey shortkey="y" @press="store.toggleLeftPane('context')" />

		<app-shell-sidebar-chat v-if="visibleLeftPane === 'chat'" />
		<app-shell-sidebar-library v-if="visibleLeftPane === 'library'" />
		<app-shell-sidebar-context v-if="visibleLeftPane === 'context'" />
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
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
