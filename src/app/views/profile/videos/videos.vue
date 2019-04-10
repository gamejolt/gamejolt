<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-xs-6 col-sm-3" v-for="video of videos" :key="video.id">
					<app-comment-video-thumbnail :video="video" />
				</div>
			</div>

			<div class="page-cut" v-if="videos.length < videosCount">
				<app-button trans @click="loadMore" v-app-track-event="`profile-videos:more`">
					<translate>Load More</translate>
				</app-button>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./videos"></script>
