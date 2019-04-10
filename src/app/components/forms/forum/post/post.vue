<template>
	<app-form name="forumPostForm">
		<app-form-group name="content_markdown" :label="$gettext('Post Content')" :hide-label="true">
			<app-form-control-markdown
				preview-class="forum-post-body"
				preview-url="/web/forums/posts/preview"
				markdown-mode="forums"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate v-if="method === 'add'">Add Reply</translate>
			<translate v-if="method === 'edit'">Save</translate>
		</app-form-button>

		<app-button v-if="method === 'edit' || replyTo" trans @click.prevent="onCancel">
			<translate>Cancel</translate>
		</app-button>
	</app-form>
</template>

<script lang="ts" src="./post"></script>
