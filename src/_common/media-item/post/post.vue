<template>
	<div class="-item" :class="{ '-inline': inline }">
		<app-responsive-dimensions
			class="-item-media"
			:class="{
				'-filled': isFilled,
			}"
			:ratio="mediaItem.width / mediaItem.height"
			:max-width="mediaItem.width"
			:max-height="deviceMaxHeight"
			@change="onDimensionsChange"
		>
			<app-event-item-media-tags :gif="mediaItem.is_animated" />
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

.-backdrop
	change-bg('bg-offset')

// Set the width to be what AppResponsiveDimensions gives us,
// so we don't overflow past what it sets.
.-img, .-video
	width: 100%
</style>

<script lang="ts" src="./post"></script>
