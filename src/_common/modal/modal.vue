<script lang="ts" src="./modal"></script>

<template>
	<div
		class="-container"
		role="dialog"
		tabindex="-1"
		:style="{
			zIndex,
		}"
		@click="dismissBackdrop"
	>
		<app-scroll-scroller
			:controller="scroller"
			class="modal"
			:class="{
				'modal-sm': modal.size === 'sm',
				'modal-lg': modal.size === 'lg',
				'modal-full': modal.size === 'full',
			}"
		>
			<component :is="!drawer ? 'div' : 'app-sticker-layer'" class="modal-sticker-layer">
				<app-theme
					class="modal-content"
					:theme="theme"
					@mouseover="isHoveringContent = true"
					@mouseout="isHoveringContent = false"
				>
					<slot />

					<app-scroll-affix v-if="hasFooter" anchor="bottom">
						<div class="-footer fill-offset">
							<slot name="footer" />
						</div>
					</app-scroll-affix>
				</app-theme>
			</component>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus">
.modal-header
	padding: $modal-padding-xs
	padding-bottom: 0
	min-height: ($modal-title-padding + $modal-title-line-height)

.modal-controls
	clearfix()
	padding-right: ($grid-gutter-width-xs / 2)
	text-align: right

	.button
		border-top: 0 !important
		border-top-left-radius: 0 !important
		border-top-right-radius: 0 !important

// Title text within header
.modal-title
	margin-top: 0

.modal-body
	position: relative
	padding: $modal-padding-xs

.modal-footer
	clearfix() // clear it in case folks use .pull-* classes on buttons
	padding: $modal-padding-xs
	padding-top: 0
	text-align: center

	@media $media-sm-up
		text-align: right

@media $media-sm-up
	.modal-header
		padding: $modal-padding
		padding-bottom: 0

	.modal-controls
		padding-right: ($grid-gutter-width / 2)

	.modal-body
		padding: $modal-padding

	.modal-footer
		padding: $modal-padding
		padding-top: 0
</style>

<style lang="stylus" scoped>
-fullscreen()
	top: 0
	right: 0
	bottom: 0
	left: 0

.-container
	-fullscreen()
	position: fixed
	overflow: hidden
	-webkit-overflow-scrolling: touch

	::v-deep(.backdrop)
		z-index: 1

// Container that the modal scrolls within
.modal
	-fullscreen()
	position: absolute
	z-index: 2

.modal-sticker-layer
	position: relative
	min-height: 100vh

	@media $media-sm-up
		padding: 30px 0
		padding-top: 100px

.modal-content
	change-bg('bg')
	theme-prop('color', 'fg')
	elevate-3()
	position: relative
	background-clip: padding-box
	outline: 0 // Remove focus outline from opened modal

	// Full screen on xs
	@media $media-xs
		min-height: 100vh

	@media $media-sm-up
		rounded-corners-lg()
		margin: 0 auto

@media $media-sm-up
	.modal-sm
		.modal-content
			width: 600px

@media $media-md-up
	.modal-content
		width: $container-md

.modal-full
	change-bg('bg')

	.modal-sticker-layer
		padding: 0

	.modal-content
		-fullscreen()
		elevate-0()
		position: absolute
		width: auto
		border-radius: 0
		background-color: transparent

.-footer
	padding: $modal-padding-xs
	padding-bottom: 0
	border-bottom-left-radius: $border-radius-large
	border-bottom-right-radius: $border-radius-large

	@media $media-sm-up
		padding: $modal-padding
		padding-bottom: 0

::v-deep(.gj-scroll-affixed)
	z-index: 1

	.-footer
		border-radius: 0
		box-shadow: 0 -5px 10px rgba(0, 0, 0, 0.1)
</style>
