<script lang="ts" src="./host-thumb-indicator"></script>

<template>
	<div
		class="-indicator-wrap"
		:class="{ '-active-hover': c.rtc && c.rtc.focusedUser === host }"
		:style="{ padding }"
	>
		<div class="-indicator">
			<template v-if="host.userModel">
				<app-user-avatar-img class="-img -help" :user="host.userModel" />
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-indicator
.-indicator-wrap
	img-circle()

.-active-hover
	elevate-2() !important

.-indicator-wrap
	elevate-1()
	height: 100%
	width: 100%
	background-color: var(--theme-link)
	overflow: hidden
	display: flex
	align-items: center
	justify-content: center
	border-radius: 50%
	transition: padding 100ms cubic-bezier(0.39, 0.58, 0.57, 1)
	will-change: padding

.-indicator
	background-color: var(--theme-bg-offset)
	color: var(--theme-fg)
	display: flex
	justify-content: center
	align-items: center
	height: 100%
	width: 100%

.-img
	&
	>>> img
		height: 100%
		width: 100%
</style>
