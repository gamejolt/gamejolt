<script lang="ts" src="./description"></script>

<template>
	<app-form name="communityDescriptionForm">
		<app-form-group name="description_content" hide-label>
			<app-form-control-content
				:placeholder="$gettext(`Write your community description here...`)"
				content-context="community-description"
				:model-id="model.id"
				:rules="{
					content_required: true,
					content_no_media_uploads: true,
					max_content_length: [lengthLimit],
				}"
				:max-height="0"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate>Save Description</translate>
		</app-form-button>
	</app-form>
</template>
