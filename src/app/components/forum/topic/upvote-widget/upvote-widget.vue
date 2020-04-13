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

		<span v-if="blipAlt" class="blip-alt" :class="{ liked: isUpvoted }">
			{{ upvoteCount | fuzzynumber }}
		</span>
		<template v-else>
			<span class="blip filled" v-if="upvoteCount > 0">
				<span class="blip-caret"></span>
				<span class="blip-count">{{ upvoteCount | number }}</span>
			</span>
			&nbsp;
		</template>
	</span>
</template>

<script lang="ts" src="./upvote-widget"></script>
