import { defineAsyncComponent } from 'vue';

export const AppContentEditorLazy = defineAsyncComponent(
	() => import('~common/content/content-editor/AppContentEditor.vue')
);
