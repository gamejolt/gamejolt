<script lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';

import AppActivityFeedItemPlaceholder from '~app/components/activity/feed/item/AppActivityFeedItemPlaceholder.vue';
import { ActivityFeedItem } from '~app/components/activity/feed/item-service';
import AppActivityFeedNotification from '~app/components/activity/feed/notification/AppActivityFeedNotification.vue';
import AppActivityFeedPost from '~app/components/activity/feed/post/AppActivityFeedPost.vue';
import { useActivityFeed } from '~app/components/activity/feed/view';
import { getScreen } from '~common/screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '~common/scroll/inview/AppScrollInview.vue';

const InviewConfig = new ScrollInviewConfig();
const InviewConfigHydration = new ScrollInviewConfig({
	margin: () => `${getScreen().screenHeight.value}px`,
});
</script>

<script lang="ts" setup>
type Props = {
	item: ActivityFeedItem;
};
const { item } = defineProps<Props>();
const feed = useActivityFeed()!;

const container = useTemplateRef('container');

const isBootstrapped = computed(() => {
	return feed.isItemBootstrapped(item);
});

onMounted(() => {
	const height = feed.getItemHeight(item);
	if (height && container.value) {
		container.value.style.height = height;
	}
});

function onInviewChange(inview: boolean) {
	if (inview) {
		feed.setItemViewed(item);
	}
}

function onInviewHydrationChange(inview: boolean) {
	feed.setItemHydration(item, inview);
}

function onResize(height: number) {
	feed.setItemHeight(item, height + 'px');
	if (container.value) {
		container.value.style.height = height + 'px';
	}
}
</script>

<template>
	<div ref="container">
		<AppScrollInview
			:config="InviewConfig"
			@inview="onInviewChange(true)"
			@outview="onInviewChange(false)"
		>
			<AppScrollInview
				:config="InviewConfigHydration"
				@inview="onInviewHydrationChange(true)"
				@outview="onInviewHydrationChange(false)"
			>
				<AppActivityFeedItemPlaceholder
					v-if="item.type !== 'notification' && !isBootstrapped"
				/>
				<template v-else>
					<!--
					Notifications are so small that there's no reason to not include them
					into the view.
					-->
					<AppActivityFeedPost
						v-if="item.type === 'event-item'"
						:item="item"
						@resize="onResize"
					/>
					<AppActivityFeedNotification
						v-else-if="item.type === 'notification'"
						:item="item"
					/>
				</template>
			</AppScrollInview>
		</AppScrollInview>
	</div>
</template>
