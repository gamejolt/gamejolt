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

<style lang="stylus" src="./thumbnail-img.styl" scoped></style>
