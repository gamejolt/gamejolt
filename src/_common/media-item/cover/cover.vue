<template>
	<div class="media-item-cover-container" :class="{ '-blur': blur }">
		<section class="section media-item-cover" :class="{ loaded: isLoaded }">
			<div class="media-item-cover-img">
				<app-media-item-backdrop
					class="-backdrop"
					:media-item="mediaItem"
					:style="{ height }"
				>
					<app-img-responsive
						v-show="isLoaded"
						:src="mediaItem.mediaserver_url"
						@imgloadchange="onLoadChange"
						alt=""
					/>
				</app-media-item-backdrop>
			</div>

			<div class="media-item-cover-content">
				<slot />
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-backdrop
	display: flex
	align-items: center

.media-item-cover-container
	change-bg('gray')
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
			position: relative
			width: 100%

.-blur
	img
		filter: blur(15px)
</style>

<script lang="ts" src="./cover"></script>
