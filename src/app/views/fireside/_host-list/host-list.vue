<script lang="ts" src="./host-list"></script>

<template>
	<app-scroll-scroller
		v-if="rtc"
		class="-fireside-hosts"
		:class="{ '-vertical': vertical }"
		:horizontal="!vertical"
	>
		<div class="-fireside-hosts-inner">
			<app-fireside-host-thumb
				v-for="host of rtc.users"
				:key="host.userId"
				class="-host-thumb"
				:host="host"
				@change-host="emitChangeHost"
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
	height: var(--fireside-host-size)

	@media $media-xs
		--fireside-host-size: 70px

	&-inner
		display: inline-flex
		justify-content: center
		grid-gap: 16px

	&.-vertical
		width: var(--fireside-host-size)
		height: auto

		.-fireside-hosts-inner
			flex-direction: column

.-host-thumb
	flex: none
</style>
