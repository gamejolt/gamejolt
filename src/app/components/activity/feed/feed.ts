import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import { Ruler } from 'game-jolt-frontend-lib/components/ruler/ruler-service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import 'rxjs/add/operator/sampleTime';
import { Subscription } from 'rxjs/Subscription';
import Vue from 'vue';
import { Component, Emit, Prop, Provide, Watch } from 'vue-property-decorator';
import AppActivityFeedItem from './item/item.vue';
import AppActivityFeedNewButton from './new-button/new-button.vue';
import { ActivityFeedView } from './view';

/**
 * The distance from the bottom of the feed that we should start loading more.
 */
const LoadMoreOffset = Screen.windowHeight * 2;

/**
 * Wait this long between scroll checks.
 */
const ScrollSampleTime = 1000;

@Component({
	components: {
		AppLoading,
		AppActivityFeedItem,
		AppActivityFeedNewButton,
		AppAdWidget,
		AppExpand,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppActivityFeed extends Vue {
	@Provide('feed')
	@Prop(ActivityFeedView)
	feed!: ActivityFeedView;

	@Prop(Number)
	newCount?: number;

	@Prop(Boolean)
	showAds?: boolean;

	// We save the scroll position every time it changes. When clicking back to
	// the same feed we can scroll to the previous position that way.
	private scroll!: number;
	private scroll$: Subscription | undefined;
	private scrollSampled$: Subscription | undefined;

	readonly number = number;

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

	@Emit('reject-post')
	emitRejectPost(_eventItem: EventItem, _community: Community) {}

	@Emit('load-new')
	emitLoadNew() {}

	@Emit('load-more')
	emitLoadMore() {}

	mounted() {
		this.scroll$ = Scroll.watcher.changes.subscribe(() => {
			// We use the scroll top directly, instead of going through scroll
			// watcher, so that we can keep this as fast as possible.
			this.scroll = Scroll.getScrollTop();
		});

		this.scrollSampled$ = Scroll.watcher.changes.sampleTime(ScrollSampleTime).subscribe(() => {
			const { top, height } = Scroll.watcher.getScrollChange();

			// Auto-loading while scrolling.
			if (this.feed.shouldScrollLoadMore) {
				const feedOffset = Ruler.offset(this.$el as HTMLElement);
				const feedBottom = feedOffset.top + feedOffset.height;
				const scrollBottom = top + height;

				if (feedBottom - scrollBottom < LoadMoreOffset) {
					this.loadMore();
				}
			}
		});
	}

	destroyed() {
		this.feed.scroll = this.scroll;

		if (this.scroll$) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}

		if (this.scrollSampled$) {
			this.scrollSampled$.unsubscribe();
			this.scrollSampled$ = undefined;
		}
	}

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
		return this.showAds && Ads.shouldShow;
	}

	get lastPostId() {
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

	onPostRejected(eventItem: EventItem, community: Community) {
		this.emitRejectPost(eventItem, community);
	}

	onPostPinned(eventItem: EventItem) {
		this.feed.processPinned(eventItem);
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
