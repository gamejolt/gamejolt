import { defineAsyncComponent } from 'vue';

export const AppContentEditorLazy = defineAsyncComponent(
	() => import(/* webpackChunkName: "contentEditor" */ './content-editor.vue')
);
