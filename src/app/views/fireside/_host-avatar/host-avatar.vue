<script lang="ts" src="./host-avatar"></script>

<template>
	<div class="-host-avatar" :class="{ '-active': rtc.focusedUser === host }" @click="onClick">
		{{ host.userId.toString().substr(0, 3) }}
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-host-avatar
	border-radius: 50%
	background-color: var(--theme-bg-offset)
	color: var(--theme-fg)
	display: flex
	justify-content: center
	align-items: center
	margin: 8px
	cursor: pointer
	user-select: none

	&.-active
		cursor: default
		background-color: var(--theme-highlight)
		color: var(--theme-highlight-fg)
</style>
