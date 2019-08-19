<template>
	<div class="ad-video">
		<h3 class="sans-margin-bottom">
			<translate>View ad. Be upset. Keep us running.</translate>
		</h3>
		<p class="text-muted">
			This ad supports the developer! Hang tight, your {{ resourceLabel }} will begin
			<template v-if="timeRemaining">
				in {{ timeRemaining | time }}...
			</template>
			<template v-else>
				soon...
			</template>
		</p>

		<div class="ad-video-player">
			<div class="ad-video-player-play-overlay" v-if="!isAdPlaying" @click="toggle()">
				<div class="play-button-overlay">
					<app-jolticon icon="play" />
				</div>
			</div>

			<app-loading v-if="isLoading" :big="true" :centered="true"></app-loading>

			<div class="ad-video-player-embed">
				<video class="ad-video-player-embed-video">
					<source :src="blankVideoSrc" />
				</video>
			</div>

			<div class="ad-video-player-ad-container"></div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.ad-video
	text-align: center

	&-player
		position: relative
		margin: 0 auto
		width: 910px
		height: 512px

	&-player-ad-container, &-player-embed-video, &-player-play-overlay
		position: absolute
		top: 0
		left: 0
		width: 910px
		height: 512px

	&-player-play-overlay
		background-color: rgba($black, 0.2)
		cursor: pointer
		z-index: 2

		.play-button-overlay
			@extend $play-button-overlay

	&-player .loading
		position: relative
		padding-top: $grid-gutter-width
		z-index: 2
</style>

<script lang="ts" src="./video"></script>
