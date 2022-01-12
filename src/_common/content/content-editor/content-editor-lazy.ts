import { defineAsyncComponent } from 'vue';

export const AppContentEditorLazy = defineAsyncComponent(() => import('./content-editor.vue'));
