<script lang="ts" src="./bottom-drawer"></script>

<template>
	<div id="shell-bottom-drawer" class="sticker-event-listening" :style="drawerStyling">
		<div v-if="drawerStore.isDrawerOpen" class="-controls">
			<app-button
				class="-controls-button"
				icon="remove"
				primary
				solid
				sparse
				@click="onClickCancel"
			/>
		</div>
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

$-item-size = 64px
$-drawer-padding = 8px
$-grid-margin = 4px
$-min-drawer-height = ($-drawer-padding + $-grid-margin) * 2 + $-item-size

.-controls
	display: flex
	position: absolute
	left: 16px
	bottom: calc(100% + 8px)

	&-button
		elevate-2()
		margin-right: 8px

.-scroller
	height: 100%

.-drawer
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
		grid-template-columns: repeat(auto-fill, minmax($-item-size, 1fr))
		grid-gap: 8px
		justify-items: center
		margin: $-grid-margin 0

#shell-bottom-drawer
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
</style>
