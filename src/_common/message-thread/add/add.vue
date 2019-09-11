<template>
	<div class="message-thread-add">
		<app-timeline-list-item>
			<app-user-avatar-img slot="bubble" :user="app.user" />

			<div class="timeline-list-item-details">
				<slot />
			</div>
		</app-timeline-list-item>
		<hr v-if="!hideMessageSplit" class="message-thread-split" />
	</div>
</template>

<script lang="ts" src="./add"></script>
