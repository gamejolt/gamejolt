<script lang="ts" src="./post"></script>

<template>
	<div class="media-item-post" :class="{ '-inline': inline }" @click="onClickImage">
		<app-responsive-dimensions
			class="-media"
			:class="{
				'-filled': isFilled,
			}"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="mediaItem.width"
			:max-height="deviceMaxHeight"
			@change="onDimensionsChange"
		>
			<div v-if="shouldShowFullscreenOption" class="-toolbar">
				<app-button
					v-app-tooltip="$gettext(`Fullscreen`)"
					overlay
					circle
					trans
					icon="fullscreen"
					@click="emitFullscreen(mediaItem)"
				/>
			</div>
			<app-media-item-backdrop class="-backdrop" :media-item="mediaItem" :radius="itemRadius">
				<app-sticker-target
					class="-stickers"
					:controller="stickerTargetController"
					:disabled="stickersDisabled"
				>
					<app-img-responsive
						v-if="!isPostHydrated || !mediaItem.is_animated"
						class="-img"
						:style="itemStyling"
						:src="mediaItem.mediaserver_url"
						alt=""
						ondragstart="return false"
					/>
					<app-video
						v-else-if="isActive"
						class="-video"
						:style="itemStyling"
						:poster="mediaItem.mediaserver_url"
						:webm="mediaItem.mediaserver_url_webm"
						:mp4="mediaItem.mediaserver_url_mp4"
						:should-play="shouldVideoPlay"
						show-loading
					/>
				</app-sticker-target>
			</app-media-item-backdrop>
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-stickers
	width: 100%
	height: 100%

.-video
	&:after
		content: 'GIF'
		rounded-corners()
		position: absolute
		right: 8px
		bottom: 8px
		padding: 4px 6px
		background-color: rgba($black, 0.4)
		color: var(--dark-theme-fg)
		font-size: $font-size-small
		font-weight: bold
		transition: opacity 250ms $strong-ease-out

.media-item-post
	position: relative
	display: block
	vertical-align: middle
	width: 100%
	max-width: 100% !important

	&.-inline
		display: inline-block

	&:not(.-inline)
		.-img
			cursor: zoom-in

	.-media
		margin-left: auto
		margin-right: auto

	.-backdrop
		change-bg('bg-offset')

	// Set the width to be what AppResponsiveDimensions gives us,
	// so we don't overflow past what it sets.
	.-img
	.-video
		width: 100%

	.-toolbar
		position: absolute
		left: 0
		right: 0
		bottom: 12px
		display: flex
		align-items: center
		justify-content: center
		z-index: 6
		opacity: 0
		transition: opacity 0.2s ease

		@media (hover: none)
			display: none

	&:hover
		.-toolbar
			opacity: 1

		@media $media-pointer-mouse
			.-video:after
				opacity: 0
</style>
