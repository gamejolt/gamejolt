import { Component, Inject } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import {
	CommunityRouteStore,
	CommunityRouteStoreKey,
	getChannelPathFromRoute,
	setCommunityMeta,
} from '../view.store';
import { getFeedChannelSort } from '../_feed/feed-helpers';
import AppCommunitiesViewChannelHeader from './_header/header.vue';

/**
 * Route dependencies for channel-type pages.
 */
export const CommunitiesViewChannelDeps = {
	params: ['path', 'channel'],
	query: ['sort', 'feed_last_id'],
};

@Component({
	name: 'RouteCommunitiesViewChannel',
	components: {
		AppCommunitiesViewChannelHeader,
	},
})
@RouteResolver({
	deps: { params: ['path', 'channel'] },
	resolver: ({ route }) => {
		const channel = getChannelPathFromRoute(route);
		return Api.sendRequest(`/web/communities/view-channel/${route.params.path}/${channel}`);
	},
})
export default class RouteCommunitiesViewChannel extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey)
	routeStore!: CommunityRouteStore;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel;
	}

	get channelPath() {
		return this.routeStore.channelPath;
	}

	get sort() {
		return getFeedChannelSort(this.$route);
	}

	get routeTitle() {
		this.disableRouteTitleSuffix = true;

		const title = this.$gettextInterpolate(`%{ name } Community on Game Jolt`, {
			name: this.community.name,
		});

		const prefixWith = (prefix: string) => `${prefix} - ${title}`;

		if (this.channel === this.routeStore.allChannel) {
			switch (this.sort) {
				case 'hot':
					return prefixWith(this.$gettext('Hot posts'));
				case 'new':
					return prefixWith(this.$gettext('New posts'));
			}
		}

		switch (this.sort) {
			case 'hot':
				return prefixWith(
					this.$gettextInterpolate('Hot posts in %{ channel }', {
						channel: this.channel ? this.channel.displayTitle : this.channelPath,
					})
				);
			case 'new':
				return prefixWith(
					this.$gettextInterpolate('New posts in %{ channel }', {
						channel: this.channel ? this.channel.displayTitle : this.channelPath,
					})
				);
		}

		return title;
	}

	routeResolved($payload: any) {
		if ($payload.channel) {
			const channel = new CommunityChannel($payload.channel);
			if (this.channel) {
				this.channel.assign(channel);
			} else if (channel.is_archived) {
				this.community.archivedChannels.push(channel);
			}
		}

		if (this.routeTitle) {
			setCommunityMeta(this.community, this.routeTitle);
		}
	}
}
