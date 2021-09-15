<script lang="ts" src="./host-list"></script>

<template>
	<app-scroll-scroller v-if="c.rtc" class="-fireside-hosts" horizontal>
		<div class="-fireside-hosts-inner">
			<app-fireside-stream-options
				@show-popper="emitShowPopper"
				@hide-popper="emitHidePopper"
			/>

			<app-fireside-host-thumb
				v-for="host of c.rtc.users"
				:key="host.uid"
				class="-host-thumb"
				:host="host"
				:hide-options="hideThumbOptions"
				@show-popper="emitShowPopper"
				@hide-popper="emitHidePopper"
			/>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-fireside-hosts
	--fireside-host-size: 100px
	width: 100%

	@media $media-xs
		--fireside-host-size: 70px

	&-inner
		display: inline-flex
		justify-content: center
		grid-gap: 16px
		height: var(--fireside-host-size)

.-host-thumb
	flex: none
</style>
