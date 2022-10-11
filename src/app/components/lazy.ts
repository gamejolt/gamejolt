import { defineAsyncComponent } from '@vue/runtime-core';
import { lazyImportNoSSR } from '../../_common/code-splitting';
import AppActivityFeedPlaceholder from './activity/feed/AppActivityFeedPlaceholder.vue';

export const GridClientLazy = lazyImportNoSSR(() => import('./grid/client.service'));
export const ChatClientLazy = lazyImportNoSSR(() => import('./chat/client'));

export const AppAuthJoinLazy = defineAsyncComponent(
	() => import('../../_common/auth/join/join.vue')
);

export const AppCommentWidgetLazy = defineAsyncComponent(
	() => import('../../_common/comment/widget/widget.vue')
);

export const FormCommentLazy = defineAsyncComponent(
	() => import('../../_common/comment/FormComment.vue')
);

export const AppActivityFeedLazy = defineAsyncComponent({
	loader: () => import('./activity/feed/AppActivityFeed.vue'),
	loadingComponent: AppActivityFeedPlaceholder,
});

export const AppVideoPlayerShakaLazy = defineAsyncComponent(
	lazyImportNoSSR(() => import('../../_common/video/player/shaka.vue'))
);
