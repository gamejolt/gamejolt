<template>
	<div class="-container">
		<app-user-avatar class="-avatar" :user="message.user" />
		<div class="-content">
			<h4 class="-header">
				<app-jolticon icon="user-messages" />
				{{ message.user.display_name }}
			</h4>

			<app-fade-collapse :collapse-height="100">
				<app-content-viewer :source="message.content" />
			</app-fade-collapse>

			<!-- Block any interaction with the content inside the viewer. -->
			<div class="-content-overlay"></div>
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

.-content
	position: relative
	// Used to make text-overflow work with this flex item.
	min-width: 0
	width: 100%

	&-overlay
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0

.-header
	text-overflow()
	margin-bottom: 8px
</style>

<script lang="ts" src="./notification-growl"></script>
