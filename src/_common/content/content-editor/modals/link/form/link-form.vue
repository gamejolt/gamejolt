<template>
	<app-form name="contentEditorLinkForm">
		<app-form-group name="href" :optional="false" :label="$gettext(`Link Destination`)">
			<app-form-control placeholder="https://example.com" v-app-focus-when />
		</app-form-group>

		<!-- <app-form-group
		name="title"
		:optional="true"
		:label="$gettext(`Link Title`)">
		<app-form-control
			:placeholder="$gettext(`Enter a text that describes your link destination.`)"
			/>
		</app-form-group> -->

		<app-form-button :disabled="!valid">
			<translate>Insert Link</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./link-form"></script>
