<script lang="ts" src="./editor-form"></script>

<template>
	<app-form :controller="form">
		<app-form-group name="content_markdown" :label="$gettext('Content')" hide-label>
			<app-form-control-markdown
				:markdown-mode="mode + '-site'"
				media-item-type="sites-content-image"
			/>

			<app-form-control-errors />
		</app-form-group>
	</app-form>
</template>
