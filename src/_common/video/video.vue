<script lang="ts" src="./video"></script>

<template>
	<div class="video">
		<template v-if="!GJ_IS_SSR">
			<div v-if="!isLoaded && showLoading" class="video-loader">
				<app-loading :hide-label="true" :no-color="true" :stationary="true" />
			</div>
		</template>
		<template v-else>
			<video :poster="poster" loop autoplay muted playsinline>
				<source type="video/webm" :src="webm" />
				<source type="video/mp4" :src="mp4" />
			</video>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.video
	position: relative

	&-loader
		position: absolute
		top: 0
		right: 0
		bottom: 0
		left: 0
		background-color: rgba($black, 0.5)
		z-index: 2
		display: flex
		align-items: center
		justify-content: center

	>>> video
		display: block
		width: 100%
</style>
