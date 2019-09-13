import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { number } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import AppGameThumbnail from '../../../../../_common/game/thumbnail/thumbnail.vue';
import { Meta } from '../../../../../_common/meta/meta-service';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/affix/affix.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import AppActivityFeed from '../../../../components/activity/feed/feed.vue';
import AppActivityFeedNewButton from '../../../../components/activity/feed/new-button/new-button.vue';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppCommunityDescription from '../../../../components/community/description/description.vue';
import AppPageContainer from '../../../../components/page-container/page-container.vue';
import AppPostAddButton from '../../../../components/post/add-button/add-button.vue';
import { Store } from '../../../../store/index';
import AppCommunitiesViewOverviewNav from './_nav/nav.vue';

function getChannel(route: Route) {
	return route.params.channel || 'featured';
}

function getSort(route: Route) {
	return (route.query.sort || 'new').toString();
}

function getFetchUrl(route: Route) {
	const channel = getChannel(route);
	const sort = getSort(route);
	const channels: string[] = [sort];

	if (channel !== 'all') {
		channels.push(channel);
	}

	let url = `/web/posts/fetch/community/${route.params.path}`;
	if (channels.length) {
		url += '?' + channels.map(name => `channels[]=` + encodeURIComponent(name)).join('&');
	}
	return url;
}

@Component({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppPageContainer,
		AppScrollAffix,
		AppCommunitiesViewOverviewNav,
		AppPostAddButton,
		AppActivityFeed,
		AppActivityFeedPlaceholder,
		AppExpand,
		AppActivityFeedNewButton,
		AppNavTabList,
		AppUserAvatarList,
		AppGameThumbnail,
		AppCommunityDescription,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {
		params: ['path', 'channel'],
		query: ['sort'],
	},
	resolver: ({ route }) => {
		const channel = getChannel(route);
		const sort = getSort(route);

		return Api.sendRequest(
			`/web/communities/overview/${route.params.path}/${channel}?sort=${sort}`
		);
	},
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	@Prop(Boolean)
	isEditing!: boolean;

	@State
	app!: Store['app'];

	@State
	communities!: Store['communities'];

	@State
	communityStates!: Store['communityStates'];

	feed: ActivityFeedView | null = null;
	knownMembers: User[] = [];
	knownMemberCount = 0;
	finishedLoading = false;

	readonly Screen = Screen;

	get routeTitle() {
		if (!this.community) {
			return null;
		}

		let title = this.$gettextInterpolate(
			`%{ name } Community - Fan art, videos, guides, polls and more`,
			{
				name: this.community.name,
			}
		);

		if (this.channel === 'featured' || (this.sort !== 'hot' && this.sort !== 'new')) {
			return title;
		}

		if (this.channel === 'all') {
			switch (this.sort) {
				case 'hot':
					title = this.$gettext('Hot posts');
					break;
				case 'new':
					title = this.$gettext('New posts');
					break;
			}
		} else {
			switch (this.sort) {
				case 'hot':
					title = this.$gettextInterpolate('Hot %{ tag } posts', {
						tag: this.channel,
					});
					break;
				case 'new':
					title = this.$gettextInterpolate('New %{ tag } posts', {
						tag: this.channel,
					});
					break;
			}
		}

		title +=
			' - ' +
			this.$gettextInterpolate(`%{ name } Community on Game Jolt`, {
				name: this.community.name,
			});

		this.disableRouteTitleSuffix = true;
		return title;
	}

	get channel() {
		return getChannel(this.$route);
	}

	get communityChannel() {
		const channel = this.channel;
		if (channel === 'all' || channel === 'featured') {
			return null;
		}

		return (this.community.channels || []).find(i => i.title === channel) || null;
	}

	get sort() {
		return getSort(this.$route);
	}

	get leftColClass() {
		return '-left-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-8 col-lg-7';
	}

	get rightColClass() {
		return '-right-col col-xs-12 col-sm-10 col-sm-offset-1 col-md-offset-0 col-md-4';
	}

	get shouldShowLoadNew() {
		if (!this.finishedLoading) {
			return false;
		}

		if (this.channel === 'featured' && this.communityState.unreadFeatureCount > 0) {
			return true;
		}

		const channel = this.community.channels!.find(i => i.title === this.channel);
		// Finished loading prevents the button from showing and quickly disappearing again because loading the route
		// clears the unread state on this channel.
		if (channel && this.communityState.unreadChannels.includes(channel.id)) {
			return true;
		}

		return false;
	}

	get shouldShowKnownMembers() {
		return !!this.app.user && this.knownMembers && this.knownMembers.length > 0;
	}

	get membersYouKnowCount() {
		return number(this.knownMemberCount);
	}

	get placeholderText() {
		if (
			!!this.community.post_placeholder_text &&
			this.community.post_placeholder_text.length > 0
		) {
			return this.community.post_placeholder_text;
		}
		return this.$gettext(`Share your creations!`);
	}

	get noPostsMessage() {
		let message = this.placeholderText;
		// If the message does not end with one of those chars, append a `-` to separate it from the following text.
		if (!['!', '.', '?'].some(i => message.endsWith(i))) {
			message += ' -';
		}
		return message;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
				shouldShowCommunityControls: true,
				hideCommunityInfo: true,
				shouldShowFollow: true,
				notificationWatermark: $payload.unreadWatermark,
			},
			$payload.items,
			fromCache
		);
		this.knownMembers = User.populate($payload.knownMembers || []);
		this.knownMemberCount = $payload.knownMemberCount || 0;

		Meta.description = this.$gettextInterpolate(
			// tslint:disable-next-line:max-line-length
			'Welcome to the %{ name } community on Game Jolt! Find and explore %{ name } fan art, lets plays and catch up on the latest news and theories!',
			{ name: this.community.name }
		);

		Meta.fb = {
			type: 'website',
			title: this.routeTitle,
			description: Meta.description,

			// TODO temporarily use the header image.
			// Ideally we'd like toprovide a nice image specifically for SEO from the backend.
			image: this.community.header ? this.community.header!.mediaserver_url : null,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: this.routeTitle,
			description: Meta.description,

			// TODO temporarily use the header image.
			// Ideally we'd like toprovide a nice image specifically for SEO from the backend.
			image: this.community.header ? this.community.header!.mediaserver_url : null,
		};

		if (this.channel === 'featured') {
			this.communityState.unreadFeatureCount = 0;
		} else {
			if (this.community.channels) {
				const channel = this.community.channels!.find(i => i.title === this.channel);
				if (channel) {
					this.communityState.markChannelRead(channel.id);
				}
			}
		}

		this.finishedLoading = true;
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.gotoPostFeedManage(post, this);
	}

	onPostUnfeatured(eventItem: EventItem, community: Community) {
		if (this.feed && this.channel === 'featured' && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}

	onPostRejected(eventItem: EventItem, community: Community) {
		if (this.feed && this.community.id === community.id) {
			this.feed.remove([eventItem]);
		}
	}

	onChannelsChanged(channels: CommunityChannel[]) {
		this.community.channels = channels;
	}

	onDetailsChanged(community: Community) {
		this.community.assign(community);
	}

	onClickLoadNew() {
		const channel = this.community.channels!.find(i => i.title === this.channel);
		if (channel) {
			this.communityState.markChannelRead(channel.id);
		}
		this.$emit('refresh');
	}
}
