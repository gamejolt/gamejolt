export async function ChatClientLazy() {
	return (await import(/* webpackChunkName: "chat" */ '../components/chat/client')).ChatClient;
}

export async function GridClientLazy() {
	return (await import(/* webpackChunkName: "grid" */ '../components/grid/client.service'))
		.GridClient;
}

export async function AppAuthJoinLazy() {
	return await import(/* webpackChunkName: "authJoin" */ 'game-jolt-frontend-lib/components/auth/join/join.vue');
}

export async function AppCommentWidgetLazy() {
	return await import(/* webpackChunkName: "commentWidget" */ 'game-jolt-frontend-lib/components/comment/widget/widget.vue');
}

export async function FormCommentLazy() {
	return await import(/* webpackChunkName: "commentWidget" */ 'game-jolt-frontend-lib/components/comment/add/add.vue');
}

export async function AppActivityFeedLazy() {
	return await import(/* webpackChunkName: "activityFeed" */ './activity/feed/feed.vue');
}
