<script lang="ts" setup>
import { ref } from 'vue';
import { ContentEditorAppAdapter } from '../_common/content/content-editor/app-adapter';
import AppContentEditorTS from '../_common/content/content-editor/content-editor';
import AppContentEditor from '../_common/content/content-editor/content-editor.vue';
import { AppTheme } from '../_common/theme/theme';
import { useThemeStore } from '../_common/theme/theme.store';

const themeStore = useThemeStore();
const editor = ref<AppContentEditorTS>();

const adapter = new ContentEditorAppAdapter(() => editor.value!.controller, {
	themeStore,
});
</script>

<template>
	<div id="editor">
		<AppTheme :theme="adapter.theme" />
		<AppContentEditor
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
