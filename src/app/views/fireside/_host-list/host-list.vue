<script lang="ts" src="./host-list"></script>

<template>
	<app-scroll-scroller v-if="c.rtc" class="-fireside-hosts" horizontal>
		<div class="-fireside-hosts-inner">
			<app-fireside-stream-playback v-if="showPlayback" />

			<app-fireside-stream-options
				@show-popper="emitShowPopper"
				@hide-popper="emitHidePopper"
			/>

			<app-fireside-cohost-manage v-if="canManageCohosts" />

			<app-fireside-host-thumb
				v-for="host of c.rtc.users"
				:key="host.uid"
				class="-host-thumb"
				:host="host"
				:hide-options="hideThumbOptions"
				@show-popper="emitShowPopper"
				@hide-popper="emitHidePopper"
			/>

			<app-fireside-host-list-sticker-button
				v-if="canPlaceStickers"
				v-app-auth-required
				@click="onClickStickerButton"
			/>
		</div>
	</app-scroll-scroller>
</template>

<style lang="stylus" scoped>
.-fireside-hosts
	--fireside-host-size: 100px
	--fireside-host-gap: 8px
	width: 100%

	@media $media-mobile
		--fireside-host-size: 60px
		--fireside-host-gap: 4px

	&-inner
		display: inline-flex
		justify-content: center
		grid-gap: var(--fireside-host-gap)
		height: var(--fireside-host-size)

.-host-thumb
	flex: none
</style>
