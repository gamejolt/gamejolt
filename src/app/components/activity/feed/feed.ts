import Vue from 'vue';
import { Subscription } from 'rxjs/Subscription';
import { Component, Prop, Watch } from 'vue-property-decorator';
import * as View from '!view!./feed.html';
import '../../../../lib/gj-lib-client/components/timeline-list/timeline-list.styl';

import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from './feed-container-service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppActivityFeedItem } from './item/item';
import { Model } from '../../../../lib/gj-lib-client/components/model/model.service';
import { isPrerender } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';

@View
@Component({
	components: {
		AppLoading,
		AppActivityFeedItem,
		AppAd,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppActivityFeed extends Vue {
	@Prop([String])
	type: 'Notification' | 'Fireside_Post';

	@Prop([ActivityFeedContainer])
	feed: ActivityFeedContainer;

	@Prop([Boolean])
	showEditControls?: boolean;

	@Prop([Boolean])
	showGameInfo?: boolean;

	@Prop([Boolean])
	showAds?: boolean;

	@Prop([Object])
	adResource?: Model;

	// We save the scroll position every time it changes. When clicking back to
	// the same feed we can scroll to the previous position that way.
	private scroll: number;
	private scroll$: Subscription | undefined;

	mounted() {
		this.scroll$ = Scroll.scrollChanges.subscribe(
			change => (this.scroll = change.top)
		);
	}

	destroyed() {
		this.feed.scroll = this.scroll;

		if (this.scroll$) {
			this.scroll$.unsubscribe();
			this.scroll$ = undefined;
		}
	}

	@Watch('feed', { immediate: true })
	async onFeedChanged(
		feed: ActivityFeedContainer,
		oldFeed: ActivityFeedContainer | undefined
	) {
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

	shouldShowAd(index: number) {
		if (
			!this.showAds ||
			isPrerender ||
			GJ_IS_CLIENT ||
			GJ_IS_SSR ||
			Screen.isXs
		) {
			return false;
		}

		if (
			this.adResource &&
			this.adResource instanceof Game &&
			!this.adResource._should_show_ads
		) {
			return false;
		}

		index = index + 1;
		if (index === 2 || index === 12 || index === 22) {
			return true;
		}

		return false;
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
