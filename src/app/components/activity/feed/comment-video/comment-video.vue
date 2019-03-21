<template>
	<div>
		<app-activity-feed-video
			:video-id="video.video_id"
			:thumbnail="video.img_thumbnail"
			:is-hydrated="isHydrated"
			@bootstrap="$emit('content-bootstrapped')"
			@play="$emit('expanded')"
		/>

		<br />

		<app-fade-collapse
			:collapse-height="300"
			:is-open="isOpen"
			@require-change="canToggleChanged"
			@expand="toggleFull"
		>
			<div class="comment-content" v-html="video.comment.comment_compiled"></div>
		</app-fade-collapse>

		<a class="hidden-text-expander" v-if="canToggleContent" @click="toggleFull"></a>
	</div>
</template>

<script lang="ts" src="./comment-video" />
