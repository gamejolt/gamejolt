import { defineAsyncComponent } from 'vue';

import { lazyImportNoSSR } from '~common/code-splitting';

export const FormCommentLazy = defineAsyncComponent(
	() => import('~common/comment/FormComment.vue')
);

export const AppVideoPlayerShakaLazy = defineAsyncComponent(
	lazyImportNoSSR(() => import('~common/video/player/AppVideoPlayerShaka.vue'))
);
