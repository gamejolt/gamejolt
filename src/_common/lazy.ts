import { defineAsyncComponent } from 'vue';
import { lazyImportNoSSR } from './code-splitting';

export const FormCommentLazy = defineAsyncComponent(() => import('./comment/FormComment.vue'));

export const AppVideoPlayerShakaLazy = defineAsyncComponent(
	lazyImportNoSSR(() => import('./video/player/shaka.vue'))
);
