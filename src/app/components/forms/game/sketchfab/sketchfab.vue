<template>
	<app-form name="mediaForm">
		<app-form-group name="sketchfab_id" :label="$gettext(`Sketchfab Model ID`)">
			<p class="help-block">
				<translate>This is the ID in your model's URL. For example:</translate>
				<code>
					https://sketchfab.com/models/
					<strong>ID</strong>
				</code>
			</p>
			<app-form-control type="text" />
			<app-form-control-errors />
		</app-form-group>

		<app-form-button show-when-valid>
			<translate v-if="method === 'add'">Add</translate>
			<translate v-else-if="method === 'edit'">Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./sketchfab" />
