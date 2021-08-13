<script lang="ts" src="./notification-settings"></script>

<template>
	<app-loading-fade
		class="chat-notification-settings"
		:is-loading="isLoadingNotificationSettings"
	>
		<h5 class="-header list-group-item">
			<translate>Notifications</translate>
		</h5>

		<a
			v-for="setting of notificationSettings"
			:key="setting.level"
			class="list-group-item has-icon"
			@click="onClickSetNotificationLevel(setting.level)"
		>
			<app-jolticon
				:icon="setting.level === notificationLevel ? 'radio-circle-filled' : 'radio-circle'"
			/>
			{{ setting.text }}
		</a>
	</app-loading-fade>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.chat-notification-settings
	.-header
		font-family: $font-family-heading
		font-size: $font-size-tiny
		font-weight: normal
		letter-spacing: 0.1em
		line-height: 1
		text-transform: uppercase
		margin-top: 0
		margin-bottom: 0
</style>
