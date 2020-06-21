<template>
	<div class="-container">
		<app-user-avatar class="-avatar" :user="message.user" />
		<div>
			<h4 class="-header">{{ message.user.display_name }}</h4>

			<app-fade-collapse :collapse-height="100">
				<app-content-viewer :source="message.content" />
			</app-fade-collapse>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-container
	display: flex

.-avatar
	width: 44px
	margin-right: 16px
	flex-shrink: 0
	// To visually align with the top of the h4
	margin-top: 6px
</style>

<script lang="ts" src="./notification-growl"></script>
