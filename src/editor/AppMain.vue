<script lang="ts" setup>
import { createContentEditorAppAdapter } from '../_common/content/content-editor/app-adapter';
import AppContentEditor from '../_common/content/content-editor/content-editor.vue';
import AppTheme from '../_common/theme/AppTheme.vue';
import { useThemeStore } from '../_common/theme/theme.store';

const themeStore = useThemeStore();

const adapter = createContentEditorAppAdapter({ themeStore });
</script>

<template>
	<div id="editor">
		<AppTheme :theme="adapter.theme" />
		<AppContentEditor
			v-if="adapter.isInitialized && adapter.controller"
			ref="editor"
			:key="adapter.capabilitiesKey"
			:controller="adapter.controller"
			:content-context="adapter.context"
			:value="adapter.initialContent"
			:placeholder="adapter.placeholder"
			:min-height="0"
			:max-height="0"
			@input="adapter.onContentChange($event)"
		/>
	</div>
</template>
