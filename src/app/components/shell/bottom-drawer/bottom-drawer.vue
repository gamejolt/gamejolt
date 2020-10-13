<script lang="ts" src="./bottom-drawer"></script>

<template>
	<div
		id="shell-bottom-drawer"
		class="sticker-event-listening"
		:style="drawerStyling"
		@mouseup="onMouseUp"
	>
		<div class="-drawer">
			<app-scroll-scroller class="-scroller">
				<div class="-drawer-inner">
					<app-shell-bottom-drawer-item
						v-for="{ sticker, count } of items"
						:key="sticker.id"
						:sticker="sticker"
						:count="count"
						:size="64"
					/>
				</div>
			</app-scroll-scroller>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-scroller
	height: 100%

.-drawer
	elevate-2()
	change-bg('bg-offset')
	width: 100%
	margin: 0 auto
	height: 100%
	padding: 8px
	border-top-left-radius: $border-radius-large
	border-top-right-radius: $border-radius-large

	@media $media-sm-up
		width: calc(100% - 32px)

	&-inner
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(64px, 1fr))
		grid-gap: 8px
		justify-items: center

#shell-bottom-drawer
	position: fixed
	max-height: 25vh
	left: 0
	right: 0
	bottom: 0
	z-index: $zindex-shell-drawer
	transition: bottom 250ms $strong-ease-out
	display: flex
	justify-content: center
</style>
