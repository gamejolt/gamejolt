<script lang="ts" src="./player-styleguide"></script>

<template>
	<section id="styleguide-video-player" class="section">
		<h1 class="section-header">Video Player</h1>

		<app-video-player
			poster="https://m.gjcdn.net/fireside-post-image/1300/4180951-ll-krxqej8j-v4.webp"
			:manifests="['https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd']"
		/>
	</section>
</template>
