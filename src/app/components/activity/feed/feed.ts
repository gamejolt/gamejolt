import View from '!view!./feed.html?style=./feed.styl';
import { EventItem } from 'game-jolt-frontend-lib/components/event-item/event-item.model';
import { AppExpand } from 'game-jolt-frontend-lib/components/expand/expand';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import 'rxjs/add/operator/sampleTime';
import { Subscription } from 'rxjs/Subscription';
import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { Ruler } from '../../../../lib/gj-lib-client/components/ruler/ruler-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { ActivityFeedContainer } from './feed-container-service';
import { AppActivityFeedItem } from './item/item';
import { AppActivityFeedNewButton } from './new-button/new-button';

/**
 * The distance from the bottom of the feed that we should start loading more.
 */
const LoadMoreOffset = Screen.windowHeight * 2;

/**
 * The number of times we should do an auto-load of items before stopping and requiring them to do
 * it manually.
 */
const LoadMoreTimes = 3;

/**
 * Wait this long between scroll checks.
 */
const ScrollSampleTime = 1000;

/**
 * The items we expect per page of a feed.
 */
const ItemsPerPage = 15;

@View
@Component({
	components: {
		AppLoading,
		AppActivityFeedItem,
		AppActivityFeedNewButton,
		AppAd,
		AppExpand,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppActivityFeed extends Vue {
	@Prop(ActivityFeedContainer)
	feed!: ActivityFeedContainer;

	@Prop(Number)
	newCount?: number;

	@Prop(Boolean)
	showEditControls?: boolean;

	@Prop(Boolean)
	showGameInfo?: boolean;

	@Prop(Boolean)
	showAds?: boolean;

	// We save the scroll position every time it changes. When clicking back to
	// the same feed we can scroll to the previous position that way.
	private scroll!: number;
	private scroll$: Subscription | undefined;

	readonly number = number;

	@Emit('edit-post')
	emitEditPost(_eventItem: EventItem) {}

	@Emit('publish-post')
	emitPublishPost(_eventItem: EventItem) {}

	@Emit('remove-post')
	emitRemovePost(_eventItem: EventItem) {}

	@Emit('load-new')
	emitLoadNew() {}

	@Emit('load-more')
	emitLoadMore() {}

	mounted() {
		this.scroll$ = Scroll.watcher.changes.sampleTime(ScrollSampleTime).subscribe(() => {
			const { top, height } = Scroll.watcher.getScrollChange();
			this.scroll = top;

			// Auto-loading while scrolling.
			if (
				!this.feed.noAutoload &&
				!this.feed.isLoadingMore &&
				!this.feed.reachedEnd &&
				this.feed.timesLoaded < LoadMoreTimes
			) {
				const feedOffset = Ruler.offset(this.$el);
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
	}

	@Watch('feed', { immediate: true })
	async onFeedChanged(feed: ActivityFeedContainer, oldFeed: ActivityFeedContainer | undefined) {
		// Gotta make sure the feed has compiled.
		await this.$nextTick();

		// First time getting items in.
		// Let's try scrolling to a possible active one.
		// This will happen if they click away and back to the feed.
		if (feed.items.length && feed !== oldFeed) {
			this.initScroll();
		}
	}

	private initScroll() {
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

	shouldShowAd(index: number) {
		// Show an ad after this many posts at the beginning of the feed.
		const firstAd = 2;

		// Show an ad every X posts thereafter.
		const adGap = 5;

		// Only show a max of this many ads in the feed.
		const totalAds = 4;

		index = index + 1;

		if (!this.shouldShowAds || index >= adGap * totalAds + firstAd) {
			return false;
		}

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
		this.feed.remove(eventItem);
		this.emitRemovePost(eventItem);
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

		// clear the current feed if we have more than 15 new items
		// that would exceed the load-per-page amount, and leave a gap in the posts
		await this.feed.loadNew(this.newCount > ItemsPerPage);
		this.emitLoadNew();
	}
}
