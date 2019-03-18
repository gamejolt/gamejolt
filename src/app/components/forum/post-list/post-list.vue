<template>
	<app-message-thread class="forum-post-list">
		<app-forum-post-list-item
			v-for="post of posts"
			:key="post.id"
			:topic="topic"
			:post="post"
			:user-post-count="userPostCounts[post.user_id]"
			@replied="onReplied"
		/>
	</app-message-thread>
</template>

<script lang="ts" src="./post-list" />
