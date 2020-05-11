<template>
	<div class="media-item-post" :class="{ '-inline': inline }" @click="onClickImage">
		<app-responsive-dimensions
			class="-media"
			:class="{
				'-ssr': GJ_IS_SSR,
				'-filled': isFilled,
			}"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="mediaItem.width"
			:max-height="deviceMaxHeight"
			@change="onDimensionsChange"
		>
			<div v-if="inline" class="-toolbar">
				<app-button
					@click="emitFullscreen(mediaItem)"
					overlay
					circle
					trans
					icon="fullscreen"
					v-app-tooltip="$gettext(`Fullscreen`)"
				/>
			</div>
			<app-media-item-backdrop class="-backdrop" :media-item="mediaItem" :radius="itemRadius">
				<app-img-responsive
					v-if="!isPostHydrated || !mediaItem.is_animated"
					class="-img"
					:style="itemStyling"
					:src="mediaItem.mediaserver_url"
					alt=""
					ondragstart="return false"
				/>
				<app-video
					v-else-if="shouldVideoPlay"
					class="-video"
					:style="itemStyling"
					:poster="mediaItem.mediaserver_url"
					:webm="mediaItem.mediaserver_url_webm"
					:mp4="mediaItem.mediaserver_url_mp4"
					show-loading
				/>
			</app-media-item-backdrop>
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.media-item-post
	position: relative
	display: block
	vertical-align: middle
	width: 100%
	max-width: 100% !important

	&.-inline
		display: inline-block

	.-media
		margin-left: auto
		margin-right: auto

	.-backdrop
		change-bg('bg-offset')

	// The "item" gets the correct dimensions applied, so we want to stretch
	// out any image or video in the item to be full width/height.
	.-img, .-video
		display: block
		width: inherit
		margin-left: auto
		margin-right: auto
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		overflow: hidden

		// For SSR responsive-dimensions component doesn't work, so we want
		// to instead just try showing the media however the browser would
		// show it.
		.-ssr &
			position: static
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
</style>

<script lang="ts" src="./post"></script>
