<script lang="ts" src="./shell"></script>

<template>
	<app-scroll-inview-parent>
		<div v-if="!isLoaded" class="-shell-loader">
			<app-loading stationary hide-label />
		</div>
		<slot v-else />

		<app-theme />
		<app-loading-bar />
		<app-growls />
		<app-modals />
	</app-scroll-inview-parent>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-shell-loader
	change-bg('bg')
	position: fixed
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	align-items: center
	justify-content: center
</style>
