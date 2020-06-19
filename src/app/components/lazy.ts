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

export async function AppActivityFeedLazy() {
	return await import(/* webpackChunkName: "activityFeed" */ './activity/feed/feed.vue');
}

export async function ChatClientLazy() {
	return await import(/* webpackChunkName: "chat" */ './chat/client');
}
