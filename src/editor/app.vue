<script lang="ts" src="./app"></script>

<template>
	<div id="editor">
		<app-theme :theme="adapter.theme" />

		<app-content-editor
			v-if="adapter.isInitialized"
			ref="editor"
			:content-context="adapter.context"
			:value="adapter.initialContent"
			:placeholder="adapter.placeholder"
			:min-height="0"
			:max-height="0"
			@input="adapter.onContentChange($event)"
		/>
	</div>
</template>
