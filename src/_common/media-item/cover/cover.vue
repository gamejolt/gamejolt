<template>
	<div class="media-item-cover-container" :class="{ '-blur': blur }" :style="{ height }">
		<section class="section media-item-cover" :class="{ loaded: isLoaded }">
			<div class="media-item-cover-img">
				<app-img-responsive
					v-show="isLoaded"
					:src="mediaItem.mediaserver_url"
					@imgloadchange="onLoadChange"
					alt=""
				/>
			</div>

			<div class="media-item-cover-content">
				<slot />
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.media-item-cover-container
	theme-prop('background-color', 'gray')
	display: block
	overflow: hidden
	width: 100%
	height: auto

.media-item-cover
	padding: 0
	position: relative
	overflow: hidden
	height: 100%
	display: flex
	flex-direction: column
	justify-content: center

	&-img
		position: relative
		width: 100%

		@media $media-xs
			width: 140%
			margin-left: -20%

		img
			width: 100%
			height: auto

.-blur
	img
		filter: blur(15px)
</style>

<script lang="ts" src="./cover"></script>
