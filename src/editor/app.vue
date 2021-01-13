<script lang="ts" src="./app"></script>

<template>
	<div id="editor">
		<app-theme />

		<app-content-editor
			ref="editor"
			:value="content"
			:content-context="context"
			@input="onContentChange"
		/>
	</div>
</template>
