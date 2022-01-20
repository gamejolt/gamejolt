import { defineAsyncComponent } from '@vue/runtime-core';
import AppActivityFeedPlaceholder from './activity/feed/placeholder/placeholder.vue';

export const GridClientLazy = () => import('./grid/client.service');
export const ChatClientLazy = () => import('./chat/client');

export const AppAuthJoinLazy = defineAsyncComponent(
	() => import('../../_common/auth/join/join.vue')
);

export const AppCommentWidgetLazy = defineAsyncComponent(
	() => import('../../_common/comment/widget/widget.vue')
);

export const FormCommentLazy = defineAsyncComponent(
	() => import('../../_common/comment/add/add.vue')
);

export const AppActivityFeedLazy = defineAsyncComponent({
	loader: () => import('./activity/feed/feed.vue'),
	loadingComponent: AppActivityFeedPlaceholder,
});

export const AppVideoPlayerShakaLazy = defineAsyncComponent(
	() => import('../../_common/video/player/shaka.vue')
);
