import { Component, Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { Store } from '../../../../store';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';
import { doFeedChannelPayload, resolveFeedChannelPayload } from '../_feed/feed-helpers';
import AppCommunitiesViewFeed from '../_feed/feed.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

/**
 * Route ependencies for channel-type pages.
 */
export const CommunitiesViewChannelDeps = {
	params: ['path', 'channel'],
	query: ['sort', 'feed_last_id'],
};

@Component({
	name: 'RouteCommunitiesViewChannel',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitiesViewFeed,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewChannel extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey)
	routeStore!: CommunityRouteStore;

	@State communityStates!: Store['communityStates'];

	feed: ActivityFeedView | null = null;

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get channel() {
		return this.routeStore.channel!;
	}

	get channelPath() {
		return this.routeStore.channelPath;
	}

	get routeTitle() {
		// TODO
		return 'hi';
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = resolveFeedChannelPayload(
			this.feed,
			this.community,
			this.$route,
			$payload,
			fromCache
		);

		// Meta.description = this.$gettextInterpolate(
		// 	// tslint:disable-next-line:max-line-length
		// 	`Welcome to the %{ name } community on Game Jolt! Find and explore %{ name } fan art, lets plays and catch up on the latest news and theories!`,
		// 	{ name: this.community.name }
		// );

		// Meta.fb = {
		// 	type: 'website',
		// 	title: this.routeTitle,
		// 	description: Meta.description,
		// 	image: this.community.header ? this.community.header!.mediaserver_url : null,
		// };

		// Meta.twitter = {
		// 	card: 'summary_large_image',
		// 	title: this.routeTitle,
		// 	description: Meta.description,
		// 	image: this.community.header ? this.community.header!.mediaserver_url : null,
		// };

		// if (this.channel !== CommunityPresetChannelType.ALL) {
		if (!this.routeStore.isVirtualChannel(this.channel)) {
			this.communityState.markChannelRead(this.channel.id);
		}
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}
}
