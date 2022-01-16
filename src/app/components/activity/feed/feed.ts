import { inject, nextTick, provide, reactive } from 'vue';
import { Emit, Options, Prop, Provide, Vue, Watch } from 'vue-property-decorator';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../_common/expand/expand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../../../_common/scroll/inview/inview.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { illEndOfFeed } from '../../../img/ill/illustrations';
import AppActivityFeedItem from './item/item.vue';
import AppActivityFeedNewButton from './new-button/new-button.vue';
import { ActivityFeedInterfaceKey, ActivityFeedKey, ActivityFeedView } from './view';

const InviewConfigShowNew = new ScrollInviewConfig({ margin: `-${Scroll.offsetTop}px` });
const InviewConfigLoadMore = new ScrollInviewConfig({ margin: `${Screen.height * 1.5}px` });

export type ActivityFeedInterface = ReturnType<typeof createActivityFeedInterface>;

/**
 * This is used to set up an interface with child components to be able to let
 * us know about state changes.
 */
function createActivityFeedInterface(hooks: {
	onPostEdited: (eventItem: EventItem) => void;
	onPostPublished: (eventItem: EventItem) => void;
	onPostRemoved: (eventItem: EventItem) => void;
	onPostFeatured: (eventItem: EventItem, community: Community) => void;
	onPostUnfeatured: (eventItem: EventItem, community: Community) => void;
	onPostMovedChannel: (eventItem: EventItem, movedTo: CommunityChannel) => void;
	onPostRejected: (eventItem: EventItem, community: Community) => void;
	onPostPinned: (eventItem: EventItem) => void;
	onPostUnpinned: (eventItem: EventItem) => void;
}) {
	return reactive({ ...hooks });
}

export function useActivityFeedInterface() {
	return inject(ActivityFeedInterfaceKey, null);
}

@Options({
	components: {
		AppLoading,
		AppActivityFeedItem,
		AppActivityFeedNewButton,
		AppExpand,
		AppScrollInview,
		AppIllustration,
	},
})
export default class AppActivityFeed extends Vue {
	@Prop({ type: Object, required: true })
	@Provide({ to: ActivityFeedKey })
	feed!: ActivityFeedView;

	feedInterface!: ActivityFeedInterface;
	isNewButtonInview = false;

	/**
	 * We save the scroll position every time it changes. When clicking back to
	 * the same feed we can scroll to the previous position that way. We don't
	 * set a default so that vue doesn't watch it.
	 */
	private scroll!: number;

	readonly InviewConfigShowNew = InviewConfigShowNew;
	readonly InviewConfigLoadMore = InviewConfigLoadMore;
	readonly formatNumber = formatNumber;
	readonly Scroll = Scroll;
	readonly illEndOfFeed = illEndOfFeed;

	declare $el: HTMLDivElement;

	@Emit('edit-post')
	emitEditPost(_eventItem: EventItem) {}

	@Emit('publish-post')
	emitPublishPost(_eventItem: EventItem) {}

	@Emit('remove-post')
	emitRemovePost(_eventItem: EventItem) {}

	@Emit('feature-post')
	emitFeaturePost(_eventItem: EventItem, _community: Community) {}

	@Emit('unfeature-post')
	emitUnfeaturePost(_eventItem: EventItem, _community: Community) {}

	@Emit('move-channel-post')
	emitMoveChannelPost(_eventItem: EventItem, _: any) {}

	@Emit('reject-post')
	emitRejectPost(_eventItem: EventItem, _community: Community) {}

	@Emit('load-new')
	emitLoadNew() {}

	@Emit('load-more')
	emitLoadMore() {}

	created() {
		this.feedInterface = createActivityFeedInterface({
			onPostEdited: this.onPostEdited,
			onPostPublished: this.onPostPublished,
			onPostRemoved: this.onPostRemoved,
			onPostFeatured: this.onPostFeatured,
			onPostUnfeatured: this.onPostUnfeatured,
			onPostMovedChannel: this.onPostMovedChannel,
			onPostRejected: this.onPostRejected,
			onPostPinned: this.onPostPinned,
			onPostUnpinned: this.onPostUnpinned,
		});

		provide(ActivityFeedInterfaceKey, this.feedInterface);
	}

	mounted() {
		window.addEventListener('scroll', this.onScroll);
	}

	unmounted() {
		this.feed.scroll = this.scroll;
		window.removeEventListener('scroll', this.onScroll);
	}

	onScroll = () => {
		this.scroll = Scroll.getScrollTop();
	};

	// TODO: This shouldn't be needed anymore, since we always show placholder
	// if no feed yet, and feeds aren't allowed to swap in the middle.
	@Watch('feed', { immediate: true })
	async onFeedChanged(feed: ActivityFeedView, oldFeed: ActivityFeedView | undefined) {
		// Gotta make sure the feed has compiled.
		await nextTick();

		// First time getting items in. Let's try scrolling to their old
		// position. This will happen if they click away and back to the feed.
		if (feed.items.length && feed !== oldFeed) {
			this.initScroll();
		}
	}

	private initScroll() {
		if (!this.feed.shouldScroll) {
			return;
		}

		const scroll = this.feed.scroll;
		if (scroll) {
			Scroll.to(scroll, { animate: false });
		}
	}

	get shouldShowLoadMore() {
		return !this.feed.reachedEnd && !this.feed.isLoadingMore && this.feed.hasItems;
	}

	get lastPostScrollId() {
		return this.feed.state.endScrollId;
	}

	get newCount() {
		return this.feed.newCount;
	}

	onNewButtonInview() {
		this.isNewButtonInview = true;
	}

	onPostEdited(eventItem: EventItem) {
		this.feed.update(eventItem);
		this.emitEditPost(eventItem);
	}

	onPostPublished(eventItem: EventItem) {
		this.feed.update(eventItem);
		this.emitPublishPost(eventItem);
	}

	onPostRemoved(eventItem: EventItem) {
		this.feed.remove([eventItem]);
		this.emitRemovePost(eventItem);
	}

	onPostFeatured(eventItem: EventItem, community: Community) {
		this.emitFeaturePost(eventItem, community);
	}

	onPostUnfeatured(eventItem: EventItem, community: Community) {
		this.emitUnfeaturePost(eventItem, community);
	}

	onPostMovedChannel(eventItem: EventItem, movedTo: CommunityChannel) {
		this.emitMoveChannelPost(eventItem, movedTo);
	}

	onPostRejected(eventItem: EventItem, community: Community) {
		this.emitRejectPost(eventItem, community);
	}

	onPostPinned(eventItem: EventItem) {
		// Pin the passed in item, and unpin all others.
		for (const item of this.feed.items) {
			if (
				item.feedItem instanceof EventItem &&
				item.feedItem.type === EventItem.TYPE_POST_ADD &&
				item.feedItem.action instanceof FiresidePost
			) {
				item.feedItem.action.is_pinned = false;
			}
		}

		if (
			eventItem.type === EventItem.TYPE_POST_ADD &&
			eventItem.action instanceof FiresidePost
		) {
			eventItem.action.is_pinned = true;
		}
	}

	onPostUnpinned(eventItem: EventItem) {
		if (
			eventItem.type === EventItem.TYPE_POST_ADD &&
			eventItem.action instanceof FiresidePost
		) {
			eventItem.action.is_pinned = false;
		}
		this.onPostEdited(eventItem);
	}

	// Auto-loading while scrolling.
	onScrollLoadMore() {
		if (!this.feed.shouldScrollLoadMore) {
			return;
		}

		this.loadMore();
	}

	loadMoreButton() {
		this.feed.timesLoaded = 0;
		this.loadMore();
	}

	loadMore() {
		this.feed.loadMore();
		this.emitLoadMore();
	}

	async loadNew() {
		if (!this.newCount) {
			return;
		}

		await this.feed.loadNew();
		this.feed.newCount = 0;
		this.emitLoadNew();
		// Make sure this is after the emitter so we remove the button before resetting
		this.isNewButtonInview = false;
	}
}