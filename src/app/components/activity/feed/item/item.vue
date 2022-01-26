<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { ActivityFeedItem } from '../item-service';
import AppActivityFeedNotification from '../notification/notification.vue';
import AppActivityFeedPost from '../post/post.vue';
import { ActivityFeedKey, ActivityFeedView } from '../view';
import AppActivityFeedItemPlaceholder from './placeholder/placeholder.vue';

const InviewConfig = new ScrollInviewConfig();
const InviewConfigHydration = new ScrollInviewConfig({ margin: `${Screen.height}px` });

@Options({
	components: {
		AppScrollInview,
		AppActivityFeedPost,
		AppActivityFeedNotification,
		AppActivityFeedItemPlaceholder,
	},
})
export default class AppActivityFeedItem extends Vue {
	@Prop({ type: Object, required: true })
	item!: ActivityFeedItem;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	readonly InviewConfig = InviewConfig;
	readonly InviewConfigHydration = InviewConfigHydration;

	mounted() {
		const height = this.feed.getItemHeight(this.item);
		if (height) {
			(this.$el as HTMLElement).style.height = height;
		}
	}

	get isBootstrapped() {
		return this.feed.isItemBootstrapped(this.item);
	}

	get height() {
		// Don't set height for notifications since they're tiny.
		return this.item.type !== 'notification' ? this.feed.getItemHeight(this.item) : undefined;
	}

	onInviewChange(inview: boolean) {
		if (inview) {
			this.feed.setItemViewed(this.item);
		}
	}

	onInviewHydrationChange(inview: boolean) {
		this.feed.setItemHydration(this.item, inview);
	}

	onResize(height: number) {
		this.feed.setItemHeight(this.item, height + 'px');
		(this.$el as HTMLElement).style.height = height + 'px';
	}
}
</script>

<template>
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
</template>
