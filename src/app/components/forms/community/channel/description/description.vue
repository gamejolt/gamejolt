<script lang="ts" src="./description"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="description_content" hide-label>
			<app-form-control-content
				:placeholder="$gettext(`Write your channel description here...`)"
				content-context="community-channel-description"
				:model-id="model.id"
				:validators="[
					validateContentRequired(),
					validateContentNoActiveUploads(),
					validateContentMaxLength(lengthLimit),
				]"
				:max-height="0"
				:validate-on="['blur']"
			/>

			<app-form-control-errors />
		</app-form-group>

		<app-form-button show-when-valid>
			<translate>Save Description</translate>
		</app-form-button>
	</app-form>
</template>
