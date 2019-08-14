<template>
	<span v-app-auth-required>
		<app-button
			icon="heart"
			circle
			:trans="trans"
			:overlay="overlay"
			:block="block"
			:primary="!!comment.user_vote"
			:solid="!!comment.user_vote"
			:disabled="isProcessing"
			@click="toggle"
		/>
		<a @click="showLikers()" v-app-tooltip="$gettext(`View all people that liked this video`)">
			<span v-if="blip" class="blip" :class="{ filled: !!comment.user_vote }">
				<span class="blip-caret"></span>
				<span class="blip-count">{{ blip }}</span>
			</span>
		</a>
	</span>
</template>

<script lang="ts" src="./like-widget"></script>
