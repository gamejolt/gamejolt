<script lang="ts" src="./host-list"></script>

<template>
	<div v-if="rtc" class="-fireside-hosts">
		<div v-for="host of rtc.users" :key="host.userId" class="-host-outer">
			<div class="-host-spacer" />
			<app-fireside-host-avatar class="-host" :host="host" @change-host="emitChangeHost" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-fireside-hosts
	width: 100%
	display: flex
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
		max-width: 64px
		flex: auto
</style>
