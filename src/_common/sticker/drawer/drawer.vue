<script lang="ts" src="./drawer"></script>

<template>
	<div
		class="sticker-drawer"
		:class="{ '-cbar-shifted': hasCbar }"
		:style="drawerStyling"
		@contextmenu.prevent
	>
		<div class="-drawer-outer">
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

$-item-size = 64px
$-drawer-padding = 8px
$-grid-margin = 4px
$-min-drawer-height = ($-drawer-padding + $-grid-margin) * 2 + $-item-size

.sticker-drawer
	position: fixed
	max-height: 25vh
	min-height: $-min-drawer-height
	left: 0
	right: 0
	bottom: 0
	z-index: $zindex-shell-drawer
	transition: bottom 250ms $strong-ease-out
	display: flex
	justify-content: center

	&.-cbar-shifted
		left: $shell-cbar-width

.-scroller
	height: 100%

.-drawer
	&-outer
		elevate-2()
		change-bg('bg')
		width: 100%
		margin: 0 auto
		height: 100%
		padding: $-drawer-padding
		border-top-left-radius: $border-radius-large
		border-top-right-radius: $border-radius-large

		@media $media-sm-up
			width: calc(100% - 32px)

	&-inner
		display: grid
		grid-template-columns: repeat(auto-fit, $-item-size)
		grid-gap: 8px
		justify-content: center
		margin: $-grid-margin 0
</style>
