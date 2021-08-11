import { defineAsyncComponent } from '@vue/runtime-core';
import AppActivityFeedPlaceholder from './activity/feed/placeholder/placeholder.vue';

export async function GridClientLazy() {
	return (await import(/* webpackChunkName: "grid" */ './grid/client.service')).GridClient;
}

export const AppAuthJoinLazy = defineAsyncComponent(
	() => import(/* webpackChunkName: "authJoin" */ '../../_common/auth/join/join.vue')
);

export const AppCommentWidgetLazy = defineAsyncComponent(
	() => import(/* webpackChunkName: "commentWidget" */ '../../_common/comment/widget/widget.vue')
);

export const FormCommentLazy = defineAsyncComponent(
	() => import(/* webpackChunkName: "commentWidget" */ '../../_common/comment/add/add.vue')
);

export const AppActivityFeedLazy = defineAsyncComponent({
	loader: () => import(/* webpackChunkName: "activityFeed" */ './activity/feed/feed.vue'),
	loadingComponent: AppActivityFeedPlaceholder,
});

export const ChatClientLazy = defineAsyncComponent(
	() => import(/* webpackChunkName: "chat" */ './chat/client')
);

export const AppVideoPlayerShakaLazy = defineAsyncComponent(
	() => import(/* webpackChunkName: "video" */ '../../_common/video/player/shaka.vue')
);
