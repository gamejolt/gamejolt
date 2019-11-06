import { Component, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { Community } from '../../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/img/img.vue';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Meta } from '../../../../../_common/meta/meta-service';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/affix/affix.vue';
import { ThemeMutation, ThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { getBlockReason } from '../../../../../_common/user/block/block.model';
import { User } from '../../../../../_common/user/user.model';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import AppActivityFeed from '../../../../components/activity/feed/feed.vue';
import AppActivityFeedNewButton from '../../../../components/activity/feed/new-button/new-button.vue';
import AppActivityFeedPlaceholder from '../../../../components/activity/feed/placeholder/placeholder.vue';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { CommunitySidebarModal } from '../../../../components/community/sidebar/modal/modal.service';
import AppCommunitySidebar from '../../../../components/community/sidebar/sidebar.vue';
import AppPageContainer from '../../../../components/page-container/page-container.vue';
import AppPostAddButton from '../../../../components/post/add-button/add-button.vue';
import { Store } from '../../../../store/index';
import AppCommunitiesViewOverviewNavEdit from './_nav/edit/edit.vue';
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
		AppCommunitiesViewOverviewNavEdit,
		AppCommunitySidebar,
		AppCommunityThumbnailImg,
		AppTimeAgo,
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

	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	feed: ActivityFeedView | null = null;
	knownMembers: User[] = [];
	knownMemberCount = 0;
	finishedLoading = false;
	owner: User | null = null;
	collaborators: User[] = [];
	collaboratorCount = 0;
	initialCollaboratorCount = 0;

	readonly Screen = Screen;

	get routeTitle() {
		if (!this.community) {
			return null;
		}

		if (this.isEditing) {
			return this.$gettextInterpolate(`Edit Community %{ community }`, {
				community: this.community.name,
			});
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

	get communityBlockReason() {
		if (!this.community.user_block) {
			return '';
		}

		return getBlockReason(this.$gettext, this.community.user_block.reason);
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
		this.finishedLoading = false;
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
				hideCommunity: true,
				hideCommunityChannel: this.channel !== 'featured',
				shouldShowFollow: true,
				notificationWatermark: $payload.unreadWatermark,
			},
			$payload.items,
			fromCache
		);
		this.knownMembers = User.populate($payload.knownMembers || []);
		this.knownMemberCount = $payload.knownMemberCount || 0;
		if ($payload.owner) {
			this.owner = new User($payload.owner);
		}
		if ($payload.collaborators) {
			this.collaborators = User.populate($payload.collaborators);
		}
		this.collaboratorCount = $payload.collaboratorCount;
		this.initialCollaboratorCount = $payload.initialCollaboratorCount;

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
			// Ideally we'd like to provide a nice image specifically for SEO from the backend.
			image: this.community.header ? this.community.header!.mediaserver_url : null,
		};

		if (this.channel === 'featured') {
			this.communityState.unreadFeatureCount = 0;
		} else {
			if (this.community.channels) {
				const channel = this.community.channels.find(i => i.title === this.channel);
				if (channel) {
					this.communityState.markChannelRead(channel.id);
				}
			}
		}

		this.finishedLoading = true;
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
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

	onPostMovedChannel(eventItem: EventItem, movedTo: CommunityChannel) {
		if (this.feed && this.channel !== 'featured' && this.channel !== movedTo.title) {
			this.feed.remove([eventItem]);
		}
	}

	onChannelsChanged(channels: CommunityChannel[]) {
		this.community.channels = channels;
	}

	onDetailsChanged(community: Community) {
		this.community.assign(community);
		this.setPageTheme(community.theme || null);
	}

	async onClickLoadNew() {
		const channel = this.community.channels!.find(i => i.title === this.channel);
		let loadNewCount = 0;
		if (channel) {
			this.communityState.markChannelRead(channel.id);
		} else {
			// For the featured view, we know how many posts are new. Load that many.
			loadNewCount = this.communityState.unreadFeatureCount;
			this.communityState.unreadFeatureCount = 0; // Set to read.
		}
		// Load 15 new posts for channels or if we are unable to acquire the count.
		if (loadNewCount <= 0) {
			loadNewCount = 15;
		}
		await this.feed!.loadNew(loadNewCount);

		// Mark the community/channel as read after loading new posts.
		Api.sendRequest(
			`/web/communities/mark-as-read/${this.community.path}/${this.channel}`,
			undefined,
			{ detach: true }
		);
	}

	onClickAbout() {
		CommunitySidebarModal.show({
			community: this.community,
			isEditing: this.isEditing,
			owner: this.owner,
			knownMembers: this.knownMembers,
			knownMemberCount: this.knownMemberCount,
			collaborators: this.collaborators,
			collaboratorCount: this.collaboratorCount,
			initialCollaboratorCount: this.initialCollaboratorCount,
		});
	}
}
