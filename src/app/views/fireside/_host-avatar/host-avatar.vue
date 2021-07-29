<script lang="ts" src="./host-avatar"></script>

<template>
	<div class="-wrapper" :style="{ 'border-width': talking * 5 + 'px' }">
		<div
			class="-avatar"
			:class="{ '-active': rtc.focusedUserId === host.userId }"
			@click="onClick"
		>
			<template v-if="host.userModel">
				<app-user-avatar-img :user="host.userModel" />
			</template>
			<template v-else>
				{{ host.userId.toString().substr(0, 3) }}
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-wrapper
	margin: 4px
	border-radius: 50%
	border-style: solid
	border-color: var(--theme-highlight)
	transition: border-width 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
	will-change: border-width

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
		// border: 3px solid var(--theme-highlight)
		background-color: var(--theme-highlight)
		color: var(--theme-highlight-fg)
</style>
