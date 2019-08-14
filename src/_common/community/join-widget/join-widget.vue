<template>
	<app-button
		class="community-follow-widget"
		primary
		:block="block"
		:solid="community.is_member"
		:badge="badge"
		:disabled="isProcessing"
		v-app-auth-required
		v-app-track-event="
			`community-join:${eventLabel || 'any'}:${!community.is_member ? 'join' : 'leave'}`
		"
		@click="onClick"
	>
		<template v-if="!community.is_member">
			<translate>Join Community</translate>
		</template>
		<template v-else>
			<translate>Joined</translate>
		</template>
	</app-button>
</template>

<script lang="ts" src="./join-widget"></script>
