import { AsyncComponentFactory } from 'vue/types/options';
import AppActivityFeedPlaceholder from './activity/feed/placeholder/placeholder.vue';

export async function GridClientLazy() {
	return (await import(/* webpackChunkName: "grid" */ './grid/client.service')).GridClient;
}

export async function AppAuthJoinLazy() {
	// Don't lazy load in SSR.
	// If we do, it'll be loaded as an async chunk and included in the page as a prefetch and styling will not apply.
	return GJ_IS_SSR
		? require('../../_common/auth/join/join.vue')
		: await import(/* webpackChunkName: "authJoin" */ '../../_common/auth/join/join.vue');
}

export async function AppCommentWidgetLazy() {
	return await import(
		/* webpackChunkName: "commentWidget" */ '../../_common/comment/widget/widget.vue'
	);
}

export async function FormCommentLazy() {
	return await import(
		/* webpackChunkName: "commentWidget" */ '../../_common/comment/add/add.vue'
	);
}

export const AppActivityFeedLazy: AsyncComponentFactory = () => ({
	component: import(/* webpackChunkName: "activityFeed" */ './activity/feed/feed.vue') as any,
	loading: AppActivityFeedPlaceholder,
});

export async function ChatClientLazy() {
	return await import(/* webpackChunkName: "chat" */ './chat/client');
}

export async function AppVideoPlayerShakaLazy() {
	return await import(/* webpackChunkName: "video" */ '../../_common/video/player/shaka.vue');
}
