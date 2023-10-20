import { defineAsyncComponent } from 'vue';
import { lazyImportNoSSR } from '../../_common/code-splitting';
import AppActivityFeedPlaceholder from './activity/feed/AppActivityFeedPlaceholder.vue';

export const GridClientLazy = lazyImportNoSSR(() => import('./grid/client.service'));
export const ChatClientLazy = lazyImportNoSSR(() => import('./chat/client'));

export const AppActivityFeedLazy = defineAsyncComponent({
	loader: () => import('./activity/feed/AppActivityFeed.vue'),
	loadingComponent: AppActivityFeedPlaceholder,
});

export const AppCommentWidgetLazy = defineAsyncComponent(
	() => import('./comment/widget/AppCommentWidget.vue')
);
