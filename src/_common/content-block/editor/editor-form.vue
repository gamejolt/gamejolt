<template>
	<app-form name="contentBlockEditorForm">
		<app-form-group name="content_markdown" :label="$gettext('Content')" :hide-label="true">
			<app-form-control-markdown
				:markdown-mode="mode + '-site'"
				:disable-preview="true"
				:html-support="true"
				:allow-code-editor="true"
				:show-media-items="true"
				media-item-type="sites-content-image"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>

<script lang="ts" src="./editor-form"></script>
