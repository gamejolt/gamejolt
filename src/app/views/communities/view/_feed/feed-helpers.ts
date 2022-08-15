import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import { configCommunityFrontpageFeedType } from '../../../../../_common/config/config.service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { getChannelPathFromRoute } from '../view.store';

/**
 * Use in the route resolvers for feed channels to do the API call.
 */
export function doFeedChannelPayload(route: RouteLocationNormalized) {
	const channel = getChannelPathFromRoute(route);
	const sort = getFeedChannelSort(route);
	let apiOverviewUrl = `/web/communities/overview/${route.params.path}/${channel}?sort=${sort}`;
	if (
		channel === CommunityPresetChannelType.FEATURED &&
		configCommunityFrontpageFeedType.value !== configCommunityFrontpageFeedType.defaultValue
	) {
		apiOverviewUrl += '&frontpage-feed-type=' + configCommunityFrontpageFeedType.value;
	}

	return Api.sendRequest(ActivityFeedService.makeFeedUrl(route, apiOverviewUrl));
}

/**
 * Use to finish resolving the feed channel payload.
 */
export function resolveFeedChannelPayload(
	feed: null | ActivityFeedView,
	mainCommunity: Community,
	route: RouteLocationNormalized,
	payload: any,
	fromCache: boolean
) {
	const channel = getChannelPathFromRoute(route);

	let feedName = null;
	switch (channel) {
		case CommunityPresetChannelType.FEATURED:
			feedName = 'community-featured';
			break;

		case CommunityPresetChannelType.ALL:
			feedName = 'community-all';
			break;

		default:
			feedName = 'community-channel';
			break;
	}

	return ActivityFeedService.routed(
		feed,
		{
			type: 'EventItem',
			name: feedName,
			url: getFeedChannelFetchUrl(route),
			mainCommunity,
			shouldShowFollow: true,
			notificationWatermark: payload.unreadWatermark,
			itemsPerPage: payload.perPage,
			shouldShowDates: channel !== CommunityPresetChannelType.FEATURED,
		},
		payload.items,
		fromCache
	);
}

export function getFeedChannelSort(route: RouteLocationNormalized) {
	return (route.query.sort || 'new').toString();
}

export function getFeedChannelFetchUrl(route: RouteLocationNormalized) {
	const channel = getChannelPathFromRoute(route)!;
	const sort = getFeedChannelSort(route);
	const channels: string[] = [sort];

	if (channel !== CommunityPresetChannelType.ALL) {
		channels.push(channel);
	}

	let url = `/web/posts/fetch/community/${route.params.path}`;

	const urlParams = [];
	if (channels.length) {
		urlParams.push(...channels.map(name => `channels[]=` + encodeURIComponent(name)));
	}
	if (
		channel === CommunityPresetChannelType.FEATURED &&
		configCommunityFrontpageFeedType.value !== configCommunityFrontpageFeedType.defaultValue
	) {
		urlParams.push(
			'frontpage-feed-type=' + encodeURIComponent(configCommunityFrontpageFeedType.value)
		);
	}
	if (urlParams.length > 0) {
		url += '?';
		url += urlParams.join('&');
	}

	return url;
}
