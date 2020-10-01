import { Route } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import { getChannelPathFromRoute } from '../view.store';

/**
 * Use in the route resolvers for feed channels to do the API call.
 */
export function doFeedChannelPayload(route: Route) {
	const channel = getChannelPathFromRoute(route);
	const sort = getFeedChannelSort(route);
	const apiOverviewUrl = `/web/communities/overview/${route.params.path}/${channel}?sort=${sort}`;

	return Api.sendRequest(ActivityFeedService.makeFeedUrl(route, apiOverviewUrl));
}

/**
 * Use to finish resolving the feed channel payload.
 */
export function resolveFeedChannelPayload(
	feed: null | ActivityFeedView,
	mainCommunity: Community,
	route: Route,
	payload: any,
	fromCache: boolean
) {
	return ActivityFeedService.routed(
		feed,
		{
			type: 'EventItem',
			url: getFeedChannelFetchUrl(route),
			mainCommunity,
			shouldShowFollow: true,
			notificationWatermark: payload.unreadWatermark,
			// For community feeds, we never know how many new items we have, so we set the count to 1.
			showNewCountNumber: false,
		},
		payload.items,
		fromCache
	);
}

export function getFeedChannelSort(route: Route) {
	return (route.query.sort || 'new').toString();
}

export function getFeedChannelFetchUrl(route: Route) {
	const channel = getChannelPathFromRoute(route)!;
	const sort = getFeedChannelSort(route);
	const channels: string[] = [sort];

	if (channel !== CommunityPresetChannelType.ALL) {
		channels.push(channel);
	}

	let url = `/web/posts/fetch/community/${route.params.path}`;
	if (channels.length) {
		url += '?' + channels.map(name => `channels[]=` + encodeURIComponent(name)).join('&');
	}
	return url;
}
