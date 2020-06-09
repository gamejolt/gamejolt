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
			<div v-if="shouldShowFullscreen" class="-toolbar">
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

	// Set the width to be what AppResponsiveDimensions gives us,
	// so we don't overflow past what it sets.
	.-img, .-video
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
