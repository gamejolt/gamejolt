<script lang="ts" src="./comment"></script>

<template>
	<app-message-thread-item :user="comment.user" :date="comment.posted_on" is-last is-reply>
		<app-comment-content :comment="comment" :content="comment.comment_content" />
		<app-comment-controls :comment="comment" />
	</app-message-thread-item>
</template>
