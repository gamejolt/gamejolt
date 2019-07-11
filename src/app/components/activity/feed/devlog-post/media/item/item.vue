<template>
	<app-responsive-dimensions
		class="-item"
		:class="{
			'-ssr': GJ_IS_SSR,
			'-filled': isFilled,
		}"
		:ratio="mediaItem.width / mediaItem.height"
		:max-width="mediaItem.width"
		@change="onDimensionsChange"
	>
		<app-event-item-media-tags :gif="mediaItem.is_animated" />

		<app-img-responsive
			v-if="!isPostHydrated || !mediaItem.is_animated"
			class="-img"
			:style="{
				maxWidth: mediaItem.width + 'px',
			}"
			:src="mediaItem.mediaserver_url"
			alt=""
			ondragstart="return false"
		/>
		<app-video
			v-else-if="shouldVideoPlay"
			class="-video"
			:style="{
				maxWidth: mediaItem.width + 'px',
			}"
			:poster="mediaItem.mediaserver_url"
			:webm="mediaItem.mediaserver_url_webm"
			:mp4="mediaItem.mediaserver_url_mp4"
			show-loading
		/>
	</app-responsive-dimensions>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-item
	position: relative
	display: inline-block
	vertical-align: middle
	width: 100%
	max-width: 100% !important

// The "item" gets the correct dimensions applied, so we want to stretch
// out any image or video in the item to be full width/height.
.-img, .-video
	rounded-corners-lg()
	change-bg('bg-offset')
	display: block
	width: 100%
	margin-left: auto
	margin-right: auto
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	overflow: hidden

	.-filled &
		border-radius: 0

	// For SSR responsive-dimensions component doesn't work, so we want
	// to instead just try showing the media however the browser would
	// show it.
	.-ssr &
		position: static
</style>

<script lang="ts" src="./item"></script>
