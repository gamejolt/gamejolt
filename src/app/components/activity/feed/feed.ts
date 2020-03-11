import 'rxjs/add/operator/sampleTime';
import Vue from 'vue';
import { Component, Emit, Prop, Provide, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import { CommunityChannel } from '../../../../_common/community/channel/channel.model';
import { Community } from '../../../../_common/community/community.model';
import { EventItem } from '../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../_common/expand/expand.vue';
import { number } from '../../../../_common/filters/number';
import { FiresidePost } from '../../../../_common/fireside/post/post-model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../_common/scroll/inview/inview';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppActivityFeedItem from './item/item.vue';
import AppActivityFeedNewButton from './new-button/new-button.vue';
import { ActivityFeedView } from './view';

@Component({
	components: {
		AppLoading,
		AppActivityFeedItem,
		AppActivityFeedNewButton,
		AppAdWidget,
		AppExpand,
		AppScrollInview,
	},
})
export default class AppActivityFeed extends Vue {
	@Provide('feed')
	@Prop(propRequired(ActivityFeedView))
	feed!: ActivityFeedView;

	@Prop(propOptional(Number, 0)) newCount!: number;
	@Prop(propOptional(Boolean, false)) showAds!: boolean;

	/**
	 * We save the scroll position every time it changes. When clicking back to
	 * the same feed we can scroll to the previous position that way. We don't
	 * set a default so that vue doesn't watch it.
	 */
	private scroll!: number;

	readonly number = number;

	/**
	 * The distance from the bottom of the feed that we should start loading
	 * more.
	 */
	readonly loadMoreMargin = `${Screen.height * 1.5}px`;

	$el!: HTMLDivElement;

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

	mounted() {
		window.addEventListener('scroll', this.onScroll);
	}

	destroyed() {
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
		await this.$nextTick();

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

	get shouldShowAds() {
		return this.showAds && this.$ad.shouldShow;
	}

	get lastPostScrollId() {
		return this.feed.state.endScrollId;
	}

	shouldShowAd(index: number) {
		// Show an ad after this many posts at the beginning of the feed.
		const firstAd = 2;

		// Show an ad every X posts thereafter.
		const adGap = 5;

		if (!this.shouldShowAds) {
			return false;
		}

		++index;
		return index === firstAd || (index - firstAd) % adGap === 0;
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

		await this.feed.loadNew(this.newCount);
		this.emitLoadNew();
	}
}
