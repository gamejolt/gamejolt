import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/sampleTime';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./feed.html';

import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from './feed-container-service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppActivityFeedItem } from './item/item';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { AppTimelineList } from '../../../../lib/gj-lib-client/components/timeline-list/timeline-list';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { Ruler } from '../../../../lib/gj-lib-client/components/ruler/ruler-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

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

@View
@Component({
	components: {
		AppLoading,
		AppActivityFeedItem,
		AppAd,
		AppTimelineList,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppActivityFeed extends Vue {
	@Prop(ActivityFeedContainer) feed: ActivityFeedContainer;
	@Prop(Boolean) showEditControls?: boolean;
	@Prop(Boolean) showGameInfo?: boolean;
	@Prop(Boolean) showAds?: boolean;

	// We save the scroll position every time it changes. When clicking back to
	// the same feed we can scroll to the previous position that way.
	private scroll: number;
	private scroll$: Subscription | undefined;

	mounted() {
		this.scroll$ = Scroll.scrollChanges.sampleTime(ScrollSampleTime).subscribe(() => {
			const { top, height } = Scroll.getScrollChange();
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
		return !this.feed.reachedEnd && !this.feed.isLoadingMore;
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

	onPostEdited(post: FiresidePost) {
		this.feed.update(post);
		this.$emit('postedited', post);
	}

	onPostPublished(post: FiresidePost) {
		this.feed.update(post);
		this.$emit('postpublished', post);
	}

	onPostRemoved(post: FiresidePost) {
		this.feed.remove(post);
		this.$emit('postremoved', post);
	}

	loadMore() {
		this.feed.loadMore();
	}
}
