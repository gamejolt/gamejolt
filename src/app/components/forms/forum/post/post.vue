<template>
	<app-form name="forumPostForm" ref="form">
		<app-form-group name="text_content" :label="$gettext('Post Content')" :hide-label="true">
			<app-form-control-content
				content-context="forum-post"
				:rules="{
					content_required: true,
					content_no_media_uploads: true,
				}"
				:validate-on="['blur']"
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
