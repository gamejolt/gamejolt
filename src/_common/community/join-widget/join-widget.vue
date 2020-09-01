<script lang="ts" src="./join-widget"></script>

<template>
	<app-button
		v-app-auth-required
		v-app-track-event="
			`community-join:${eventLabel}:${!community.is_member ? 'join' : 'leave'}`
		"
		v-app-tooltip="canJoin ? '' : $gettext(`You already joined too many communities`)"
		class="community-follow-widget"
		primary
		:block="block"
		:solid="community.is_member || solid"
		:badge="badge"
		:disabled="isDisabled"
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
