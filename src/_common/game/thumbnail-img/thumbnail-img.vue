<template>
	<div
		class="game-thumbnail-img"
		:class="{
			'-loaded': isThumbnailLoaded,
		}"
	>
		<div class="-inner">
			<app-jolticon class="-icon" icon="game" />

			<div class="-media" v-if="mediaItem && !hideMedia">
				<app-img-responsive
					class="-img"
					:src="mediaItem.mediaserver_url"
					alt=""
					@imgloadchange="imgLoadChange"
				/>

				<app-video
					v-if="hasVideo"
					class="-video"
					:poster="mediaItem.mediaserver_url"
					:webm="mediaItem.mediaserver_url_webm"
					:mp4="mediaItem.mediaserver_url_mp4"
					:should-play="shouldPlayVideo"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./thumbnail-img.styl" scoped></style>

<script lang="ts" src="./thumbnail-img"></script>
