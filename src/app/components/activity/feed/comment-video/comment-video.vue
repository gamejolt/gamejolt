<template>
	<div>
		<app-activity-feed-video
			:video-id="video.video_id"
			:thumbnail="video.img_thumbnail"
			:is-hydrated="isHydrated"
			@bootstrap="emitContentBootstrapped"
			@play="emitExpanded"
		/>

		<br />

		<app-fade-collapse
			:collapse-height="200"
			@require-change="bootstrapFadeCollapse"
			@expand="emitExpanded"
		>
			<app-content-viewer :source="video.comment.comment_content" />
		</app-fade-collapse>
	</div>
</template>

<script lang="ts" src="./comment-video"></script>
