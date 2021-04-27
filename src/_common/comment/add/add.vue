<template>
	<app-form name="commentAddForm" ref="form">
		<app-form-group name="comment_content" :label="$gettext('Leave a Comment')" hide-label>
			<app-form-control-content
				:placeholder="placeholder || $gettext(`Leave a comment...`)"
				:content-context="contentContext"
				:autofocus="autofocus"
				:rules="{
					content_required: true,
					content_no_media_uploads: true,
					max_content_length: [lengthLimit],
				}"
				:validate-on="['blur']"
				:max-height="maxHeight"
				:display-rules="displayRules"
				:model-id="contentModelId"
				focus-end
				@focus="onFocusEditor"
				@blur="onBlurEditor"
			/>

			<app-form-control-errors label="comment" />
		</app-form-group>

		<p v-if="shouldShowGuidelines" class="-guidelines">
			Remember to be respectful and follow our
			<app-link-help page="guidelines">Site Guidelines</app-link-help>.
		</p>
		<div v-else class="-buttons">
			<app-button v-if="method === 'edit'" trans @click="onCancel">
				<translate>Cancel</translate>
			</app-button>

			<app-form-button show-when-valid>
				<translate v-if="method === 'add'">Add Comment</translate>
				<translate v-else-if="method === 'edit'">Save</translate>
			</app-form-button>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-guidelines
	font-size: $font-size-small
	margin-bottom: 8px

.-buttons
	text-align: right

>>> .form-group
	margin-bottom: 8px
</style>

<script lang="ts" src="./add"></script>
