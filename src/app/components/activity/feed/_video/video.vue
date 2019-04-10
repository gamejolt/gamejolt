<template>
	<div class="-video-embed">
		<app-responsive-dimensions :ratio="16 / 9" @change="onDimensionsChange()">
			<a v-if="!isHydrated || !isShowingVideo" @click.stop="play">
				<div class="play-button-overlay">
					<app-jolticon icon="play" />
				</div>

				<div class="-thumb" :style="{ 'background-image': `url('${thumbnail}')` }"></div>
			</a>
			<app-video-embed
				v-else
				video-provider="youtube"
				:video-id="videoId"
				:autoplay="shouldAutoplay"
			/>
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@require '../variables'
@require '~styles-lib/mixins'

.-video-embed
	theme-prop('background-color', 'bg-offset')
	margin-top: $-item-padding-xs-v
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)
	position: relative

	@media $media-sm-up
		margin-top: $-item-padding-v
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)

	a
		display: block

.-thumb
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background-repeat: no-repeat
	background-position: center center
	background-size: cover
</style>

<script lang="ts" src="./video"></script>
