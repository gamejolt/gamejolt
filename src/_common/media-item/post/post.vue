<template>
	<div class="-item" :class="{ '-inline': inline }" @click="onClickImage">
		<app-responsive-dimensions
			class="-item-media"
			:class="{
				'-ssr': GJ_IS_SSR,
				'-filled': isFilled,
			}"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="mediaItem.width"
			:max-height="deviceMaxHeight"
			@change="onDimensionsChange"
		>
			<app-event-item-media-tags :gif="mediaItem.is_animated" />
			<div v-if="inline" class="-fullscreen">
				<app-button
					@click="emitFullscreen(mediaItem)"
					overlay
					circle
					icon="bolt-filled"
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

.-item
	position: relative
	display: block
	vertical-align: middle
	width: 100%
	max-width: 100% !important

	&-media
		margin-left: auto
		margin-right: auto

	&.-inline
		display: inline-block

	// Show fullscreen button on hover over image
	&:hover
		.-fullscreen
			opacity: 1

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

.-fullscreen
	position: absolute
	bottom: 10px
	right: 10px
	z-index: 6
	opacity: 0

	transition: opacity 0.2s ease
</style>

<script lang="ts" src="./post"></script>
