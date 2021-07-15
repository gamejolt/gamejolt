<script lang="ts" src="./host-avatar"></script>

<template>
	<div class="-wrapper">
		<!-- <div class="-wrapper" :class="{ '-talking': host.volumeLevel > 1 }"> -->
		<div class="-avatar" :class="{ '-active': rtc.focusedUser === host }" @click="onClick">
			{{ host.userId.toString().substr(0, 3) }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-wrapper
	border-radius: 50%
	padding: $border-width-large * 2
	margin: 4px

	&.-talking
		padding: $border-width-large
		border: $border-width-large solid var(--theme-highlight)

.-avatar
	width: 100%
	height: 100%
	border-radius: 50%
	background-color: var(--theme-bg-offset)
	color: var(--theme-fg)
	display: flex
	justify-content: center
	align-items: center
	cursor: pointer
	user-select: none

	&.-active
		cursor: default
		background-color: var(--theme-highlight)
		color: var(--theme-highlight-fg)
</style>
