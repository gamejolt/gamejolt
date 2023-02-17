import { defineAsyncComponent } from 'vue';

export const AppContentEditorLazy = defineAsyncComponent(() => import('./AppContentEditor.vue'));
