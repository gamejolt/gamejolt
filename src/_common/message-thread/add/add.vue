<script lang="ts" src="./add"></script>

<template>
	<div class="message-thread-add">
		<app-timeline-list-item>
			<template #bubble>
				<app-user-avatar-img :user="app.user" />
			</template>

			<div class="timeline-list-item-details">
				<slot />
			</div>
		</app-timeline-list-item>
		<hr v-if="!hideMessageSplit" class="message-thread-split" />
	</div>
</template>
