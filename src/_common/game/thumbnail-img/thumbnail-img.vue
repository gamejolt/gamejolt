<script lang="ts" src="./thumbnail-img"></script>

<template>
	<div
		class="game-thumbnail-img"
		:class="{
			'-loaded': isThumbnailLoaded,
		}"
	>
		<div class="-inner">
			<app-media-item-backdrop :media-item="mediaItem" radius="lg">
				<app-jolticon class="-icon" icon="game" />

				<div v-if="mediaItem && !hideMedia" class="-media">
					<app-img-responsive
						class="-img"
						:src="mediaItem.mediaserver_url"
						alt=""
						@imgloadchange="imgLoadChange"
					/>

					<app-video
						v-if="hasVideo && videoController"
						class="-video"
						:player="videoController"
						:should-play="shouldPlayVideo"
					/>
				</div>
			</app-media-item-backdrop>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.game-thumbnail-img
	rounded-corners-lg()
	change-bg('bg-offset')
	position: relative
	height: 0
	padding-top: 56.25% // HD 16:9
	overflow: hidden

.-inner
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%

.-icon
	color: white
	opacity: 0.4
	position: absolute
	font-size: 16px * 2
	left: 50%
	margin-left: -(@font-size / 2)
	top: @left
	margin-top: @margin-left

.-media
	opacity: 0
	transition: opacity 500ms
	width: 100%

	.-loaded &
		opacity: 1

.-img
.-video
	position: absolute !important
	top: 0
	left: 0
	display: block
	width: 100%
	height: 100%

.-img
	z-index: 1

.-video
	z-index: 2
</style>
