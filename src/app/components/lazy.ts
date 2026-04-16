import { defineAsyncComponent } from 'vue';

import AppActivityFeedPlaceholder from '~app/components/activity/feed/AppActivityFeedPlaceholder.vue';
import { lazyImportNoSSR } from '~common/code-splitting';

export const GridClientLazy = lazyImportNoSSR(() => import('~app/components/grid/client.service'));
export const ChatClientLazy = lazyImportNoSSR(() => import('~app/components/chat/client'));

export const AppActivityFeedLazy = defineAsyncComponent({
	loader: () => import('~app/components/activity/feed/AppActivityFeed.vue'),
	loadingComponent: AppActivityFeedPlaceholder,
});

export const AppCommentWidgetLazy = defineAsyncComponent(
	() => import('~app/components/comment/widget/AppCommentWidget.vue')
);
