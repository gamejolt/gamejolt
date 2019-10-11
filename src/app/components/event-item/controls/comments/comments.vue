<template>
	<div v-if="shouldShowInlineComment" class="-add" v-app-auth-required>
		<app-event-item-controls-comments-add-placeholder
			v-if="!clickedComment"
			@click="onClickCommentAddPlaceholder"
		/>
		<form-comment
			v-else
			:resource="resource"
			:resource-id="resourceId"
			:editor-startup-activity="clickedCommentType"
			autofocus
			@submit="onSubmitNewComment"
		/>
	</div>

	<div v-else-if="showFeed">
		<br />
		<br />

		<app-comment-widget :resource="resource" :resource-id="resourceId" :model="model" />
	</div>
</template>

<style lang="stylus" scoped>
.-add
	margin-top: 20px
</style>

<script lang="ts" src="./comments"></script>
