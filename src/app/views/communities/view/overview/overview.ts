import { Component, Emit, Prop } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../_common/api/api.service';
import { Community } from '../../../../../_common/community/community.model';
import { CommunityTag } from '../../../../../_common/community/tag/tag.model';
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
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { Store } from '../../../../store/index';
import AppActivityFeed from '../../../activity/feed/feed.vue';
import AppActivityFeedNewButton from '../../../activity/feed/new-button/new-button.vue';
import AppActivityFeedPlaceholder from '../../../activity/feed/placeholder/placeholder.vue';
import AppPageContainer from '../../../page-container/page-container.vue';
import AppPostAddButton from '../../../post/add-button/add-button.vue';
import AppCommunitiesViewOverviewNav from './_nav/nav.vue';

function getChannel(route: Route) {
	return route.params.channel || 'featured';
}

function getSort(route: Route) {
	return (route.query.sort || 'hot').toString();
}

function getFetchUrl(route: Route) {
	const channel = getChannel(route);
	const sort = getSort(route);
	const tags: string[] = [sort];

	if (channel !== 'all') {
		tags.push(channel);
	}

	let url = `/web/posts/fetch/community/${route.params.path}`;
	if (tags.length) {
		url += '?' + tags.map(tag => `tags[]=` + encodeURIComponent(tag)).join('&');
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
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {
		params: ['path', 'channel'],
		query: ['sort'],
	},
	resolver: ({ route }) =>
		Promise.all([
			Api.sendRequest(getFetchUrl(route)),
			Api.sendRequest('/web/communities/overview/' + route.params.path),
		]),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Prop(Community)
	community!: Community;

	@Prop(Number)
	unreadWatermark!: number;

	@Prop(Boolean)
	isEditing!: boolean;

	@State
	app!: Store['app'];

	@State
	communities!: Store['communities'];

	feed: ActivityFeedView | null = null;
	knownMembers: User[] = [];
	knownMemberCount = 0;

	readonly Screen = Screen;

	@Emit('refresh')
	emitRefresh() {}

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
					title = this.$gettextInterpolate('Hot #%{ tag } posts', {
						tag: this.channel,
					});
					break;
				case 'new':
					title = this.$gettextInterpolate('New #%{ tag } posts', {
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
		// We need to access the reactive community from the Store here to react to is_unread changing
		const stateCommunity = this.communities.find(c => c.id === this.community.id);
		if (stateCommunity) {
			return this.channel === 'featured' && stateCommunity.is_unread;
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

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
	}

	routeResolved($payload: any, fromCache: boolean) {
		const [itemsPayload, overviewPayload] = $payload;
		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				url: getFetchUrl(this.$route),
				shouldShowCommunityControls: true,
				hideCommunityInfo: true,
				shouldShowFollow: true,
				notificationWatermark: this.unreadWatermark,
			},
			itemsPayload.items,
			fromCache
		);
		this.knownMembers = User.populate(overviewPayload.knownMembers || []);
		this.knownMemberCount = overviewPayload.knownMemberCount || 0;

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

	onTagsChanged(tags: CommunityTag[]) {
		this.community.tags = tags;
	}
}
