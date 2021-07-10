<script lang="ts" src="./host-list"></script>

<template>
	<component
		:is="scrollable ? 'app-scroll-scroller' : 'div'"
		v-if="rtc"
		:horizontal="scrollable"
		class="-fireside-hosts"
		:class="{ '-scrollable': scrollable }"
	>
		<div class="-fireside-hosts-inner">
			<div v-for="host of rtc.users" :key="host.userId" class="-host-outer">
				<div class="-host-spacer" />
				<app-fireside-host-avatar
					class="-host"
					:host="host"
					@change-host="emitChangeHost"
				/>
			</div>
		</div>
	</component>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-max-size = 64px + ($border-width-large * 2)

.-fireside-hosts
	width: 100%

	&:not(.-scrollable)
		.-fireside-hosts-inner
			display: flex

		.-host-outer
			max-width: $-max-size
			flex: auto

	&.-scrollable
		.-fireside-hosts-inner
			display: inline-flex

		.-host-outer
			width: $-max-size
			flex: none

	&-inner
		justify-content: center

.-host
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

	&-spacer
		width: 100%
		padding-top: 100%

	&-outer
		position: relative
		display: inline-flex
		align-items: center
		justify-content: center
</style>
