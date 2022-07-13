<script lang="ts">
import { computed, onMounted, PropType, ref, toRefs } from 'vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedNotification from '../notification/notification.vue';
import AppActivityFeedPost from '../post/post.vue';
import { useActivityFeed } from '../view';
import AppActivityFeedItemPlaceholder from './AppActivityFeedItemPlaceholder.vue';

const InviewConfig = new ScrollInviewConfig();
const InviewConfigHydration = new ScrollInviewConfig({ margin: `${Screen.height}px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	item: {
		type: Object as PropType<ActivityFeedItem>,
		required: true,
	},
});

const { item } = toRefs(props);
const feed = useActivityFeed()!;

const container = ref<HTMLDivElement>();

const isBootstrapped = computed(() => {
	return feed.isItemBootstrapped(item.value);
});

onMounted(() => {
	const height = feed.getItemHeight(item.value);
	if (height && container.value) {
		container.value.style.height = height;
	}
});

function onInviewChange(inview: boolean) {
	if (inview) {
		feed.setItemViewed(item.value);
	}
}

function onInviewHydrationChange(inview: boolean) {
	feed.setItemHydration(item.value, inview);
}

function onResize(height: number) {
	feed.setItemHeight(item.value, height + 'px');
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
