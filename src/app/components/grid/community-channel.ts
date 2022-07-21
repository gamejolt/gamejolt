import { markRaw, shallowReadonly } from 'vue';
import { Router } from 'vue-router';
import { Analytics } from '../../../_common/analytics/analytics.service';
import { configHomeDefaultFeed } from '../../../_common/config/config.service';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { showInfoGrowl } from '../../../_common/growls/growls.service';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { commonStore } from '../../../_common/store/common-store';
import { $gettext, $gettextInterpolate } from '../../../_common/translate/translate.service';
import { HOME_FEED_ACTIVITY } from '../../views/home/home-feed.service';
import { GridClient } from './client.service';

export type GridCommunityChannel = Awaited<ReturnType<typeof createGridCommunityChannel>>;

interface FeaturePayload {
	post_id: string;
}

interface FeatureFiresidePayload {
	fireside_id: string;
	fireside_data: any;
}

interface NewPostPayload {
	channel_id: string;
}

export async function createGridCommunityChannel(
	client: GridClient,
	options: { communityId: number; router: Router }
) {
	const { socketController, appStore } = client;
	const { communityId, router } = options;

	const channelController = createSocketChannelController(
		`community:${communityId}`,
		socketController
	);

	channelController.listenTo('feature', _onFeature);
	channelController.listenTo('new-post', _onNewPost);
	channelController.listenTo('feature-fireside', _onFeatureFireside);

	const c = shallowReadonly({
		channelController,
		communityId,
	});

	await channelController.join({
		async onJoin() {
			client.communityChannels.push(markRaw(c));
		},
	});

	function _onFeature(payload: FeaturePayload) {
		// Suppress notification if the user featured that post.
		if (payload.post_id) {
			const postId = parseInt(payload.post_id, 10);
			if (client.featuredPostIds.has(postId)) {
				return;
			}
		}

		const communityState = appStore.communityStates.value.getCommunityState(communityId);
		communityState.hasUnreadFeaturedPosts = true;

		// Only increment when we use the activity feed as the home feed, as it
		// includes the community items only at that point.
		if (configHomeDefaultFeed.value === HOME_FEED_ACTIVITY) {
			appStore.incrementNotificationCount({ count: 1, type: 'activity' });
		}
	}

	function _onNewPost(payload: NewPostPayload) {
		const channelId = parseInt(payload.channel_id, 10);
		const communityState = appStore.communityStates.value.getCommunityState(communityId);
		communityState.markChannelUnread(channelId);
	}

	function _onFeatureFireside(payload: FeatureFiresidePayload) {
		const fireside = new Fireside(payload.fireside_data);
		if (!fireside.community) {
			console.error('Featured fireside must have a community, but it does not.');
			return;
		}

		if (commonStore.user.value && fireside.user.id === commonStore.user.value.id) {
			console.log('Suppress featured fireside notification for fireside owner.');
			return;
		}

		showInfoGrowl({
			title: $gettext(`New Featured Fireside!`),
			message: $gettextInterpolate(
				`@%{ username }'s fireside %{ firesideTitle } was featured in %{ communityName }!`,
				{
					username: fireside.user.username,
					firesideTitle: fireside.title,
					communityName: fireside.community.name,
				}
			),
			icon: fireside.user.img_avatar,
			onClick: () => {
				Analytics.trackEvent(
					'grid',
					'notification-click',
					'fireside-featured-in-community'
				);
				router.push(fireside.location);
			},
			system: true,
		});
	}

	return c;
}
