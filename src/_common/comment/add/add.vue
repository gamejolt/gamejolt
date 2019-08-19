<template>
	<app-form name="commentAddForm" ref="form">
		<app-form-group
			:class="{ 'sans-margin-bottom': (!changed || !valid) && method !== 'edit' }"
			name="comment_content"
			:label="$gettext('Leave a Comment')"
			hide-label
		>
			<app-form-control-content
				:placeholder="placeholder || $gettext(`Leave a comment...`)"
				:content-context="contentContext"
				:autofocus="autofocus"
				:rules="{
					content_required: true,
					content_no_media_uploads: true,
				}"
				:validate-on="['blur']"
				:startup-activity="editorStartupActivity"
				@focus="onFocusEditor"
				@blur="onBlurEditor"
			/>

			<app-form-control-errors label="comment" />
		</app-form-group>

		<div class="text-right">
			<app-form-button show-when-valid>
				<translate v-if="method === 'add'">Add Comment</translate>
				<translate v-else-if="method === 'edit'">Save</translate>
			</app-form-button>

			<app-button v-if="method === 'edit'" trans @click="onCancel">
				<translate>Cancel</translate>
			</app-button>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

>>> .form-group
	margin-bottom: 10px
</style>

<script lang="ts" src="./add"></script>
