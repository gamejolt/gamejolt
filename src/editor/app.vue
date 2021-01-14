<script lang="ts" src="./app"></script>

<template>
	<div id="editor">
		<app-theme />

		<app-content-editor
			ref="editor"
			:value="initialContent"
			:content-context="context"
			:min-height="0"
			:max-height="0"
			@input="onContentChange"
		/>
	</div>
</template>
