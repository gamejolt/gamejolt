import { defineAsyncComponent } from '@vue/runtime-core';
import { importNoSSR, lazyImportNoSSR } from '../../_common/code-splitting';
import AppActivityFeedPlaceholder from './activity/feed/placeholder/placeholder.vue';

export async function GridClientLazy() {
	return await importNoSSR(async () => {
		const { GridClient } = await import(/* webpackChunkName: "grid" */ './grid/client.service');
		return GridClient;
	});
}

export const ChatClientLazy = lazyImportNoSSR(
	() => import(/* webpackChunkName: "chat" */ './chat/client')
);

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
	lazyImportNoSSR(() => import('../../_common/video/player/shaka.vue'))
);
