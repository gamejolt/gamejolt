<script lang="ts" src="./topic"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="title" :label="$gettext('Title')">
			<app-form-control type="text" :validators="[validateMaxLength(300)]" />

			<app-form-control-errors />
		</app-form-group>

		<app-form-group name="text_content" :label="$gettext('Topic Content')">
			<app-form-control-content
				content-context="forum-post"
				:validators="[validateContentRequired(), validateContentNoActiveUploads()]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate v-if="method === 'add'">Add Topic</translate>
			<translate v-if="method === 'edit'">Save</translate>
		</app-form-button>

		<app-button v-if="method === 'edit'" trans @click="onCancel">
			<translate>Cancel</translate>
		</app-button>
	</app-form>
</template>
