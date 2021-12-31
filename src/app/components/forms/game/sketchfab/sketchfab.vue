<template>
	<app-form :controller="form">
		<app-form-group name="sketchfab_id" :label="$gettext(`Sketchfab Model URL`)">
			<p class="help-block">
				<translate>Enter your Sketchfab model's URL or ID. For example:</translate>
				<br />
				<code> https://sketchfab.com/3d-models/your-model-name-ID </code>
			</p>
			<app-form-control type="text" :validators="[validatePattern(SKETCHFAB_FIELD_REGEX)]" />
			<app-form-control-errors />
			<div v-if="hasValidSketchfabModelId">
				<br />
				<app-sketchfab-embed :sketchfab-id="sketchfabId" />
			</div>
		</app-form-group>

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Add</translate>
			<translate v-else-if="method === 'edit'">Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./sketchfab"></script>
