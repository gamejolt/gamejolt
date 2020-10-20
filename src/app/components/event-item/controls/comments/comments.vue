<script lang="ts" src="./comments"></script>

<template>
	<div v-if="shouldShowInlineComment" v-app-auth-required class="-add">
		<app-event-item-controls-comments-add-placeholder
			v-if="!clickedComment"
			@click="onClickCommentAddPlaceholder"
		/>
		<form-comment
			v-else
			:comment-model="model"
			:editor-startup-activity="clickedCommentType"
			autofocus
			@submit="onSubmitNewComment"
		/>
	</div>
	<div v-else-if="showFeed">
		<br />
		<br />

		<app-comment-widget :model="model" display-mode="comments" />
	</div>
</template>

<style lang="stylus" scoped>
.-add
	margin-top: 20px
</style>
