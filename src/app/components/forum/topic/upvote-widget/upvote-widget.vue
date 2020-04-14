<template>
	<span class="topic-upvote-button" v-if="canUpvote" v-app-auth-required>
		<app-button
			icon="thumbs-up"
			circle
			trans
			:primary="isUpvoted"
			:solid="isUpvoted"
			@click="onUpvoteClick"
			v-app-tooltip="upvoteTooltip"
			v-app-track-event="`topic-upvote-widget:click`"
		/>

		<span class="blip" :class="{ 'blip-active': isUpvoted }">
			{{ upvoteCount | fuzzynumber }}
		</span>
	</span>
</template>

<script lang="ts" src="./upvote-widget"></script>
