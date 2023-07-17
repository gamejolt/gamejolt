import { defineAsyncComponent } from 'vue';
import { lazyImportNoSSR } from './code-splitting';

export const FormCommentLazy = defineAsyncComponent(() => import('./comment/FormComment.vue'));

export const AppAuthJoinLazy = defineAsyncComponent(() => import('./auth/join/join.vue'));

export const AppVideoPlayerShakaLazy = defineAsyncComponent(
	lazyImportNoSSR(() => import('./video/player/AppVideoPlayerShaka.vue'))
);
