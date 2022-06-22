import { shallowReadonly, triggerRef } from 'vue';
import {
	DrawerStore,
	onFiresideStickerPlaced,
	setStickerStreak,
} from '../../../_common/drawer/drawer-store';
import { FiresideRTCHost } from '../../../_common/fireside/rtc/rtc';
import {
	createSocketChannelController,
	SocketChannelController,
} from '../../../_common/socket/socket-channel-controller';
import { StickerPlacement } from '../../../_common/sticker/placement/placement.model';
import { addStickerToTarget } from '../../../_common/sticker/target/target-controller';
import { User } from '../../../_common/user/user.model';
import {
	FiresideController,
	StreamingInfoPayload,
	updateFiresideData,
} from '../fireside/controller/controller';
import { GridClient } from './client.service';

export type GridFiresideChannel = Readonly<{
	channelController: SocketChannelController;
	firesideHash: string;
}>;

interface StickerPlacementPayload {
	user_id: number;
	streak: number;
	sticker_placement: Partial<StickerPlacement>;
}

interface UpdatePayload {
	fireside: unknown;
	chat_settings: unknown;
	// For optimization reasons streamingUids is not being sent for
	// fireside-updated messages.
	streaming_info: Omit<StreamingInfoPayload, 'streamingUids'>;
}

interface StreamingUIDPayload {
	streaming_uid: number;
	user: unknown;
	is_live: boolean;
	is_unlisted: boolean;
}

export async function createGridFiresideChannel(
	client: GridClient,
	firesideController: FiresideController,
	options: { firesideHash: string; drawerStore: DrawerStore }
): Promise<GridFiresideChannel> {
	const { socketController } = client;
	const { firesideHash, drawerStore } = options;

	const channelController = createSocketChannelController(
		`fireside:${firesideHash}`,
		socketController
	);

	channelController.listenTo('update', _onUpdate);
	channelController.listenTo('streaming-uid', _onStreamingUid);
	channelController.listenTo('sticker-placement', _onStickerPlacement);

	const c = shallowReadonly({
		channelController,
		firesideHash,
	});

	await channelController.join();

	async function _onUpdate(payload: UpdatePayload) {
		console.log('Fireside update message:', payload);

		updateFiresideData(firesideController, {
			fireside: payload.fireside,
			chatSettings: payload.chat_settings,
			streamingInfo: payload.streaming_info,
		});
	}

	function _onStreamingUid(payload: StreamingUIDPayload) {
		console.debug('[FIRESIDE] Grid streaming uid added.', payload);

		const { hosts } = firesideController;
		if (!payload.streaming_uid || !payload.user) {
			return;
		}

		const user = new User(payload.user);
		const host = hosts.value.find(host => host.user.id === user.id);
		if (host) {
			console.debug('[FIRESIDE] Adding streaming uid to existing host');

			host.user = user;
			host.needsPermissionToView = payload.is_unlisted;
			host.isLive = payload.is_live;
			if (host.uids.indexOf(payload.streaming_uid) === -1) {
				host.uids.push(payload.streaming_uid);
			}
		} else {
			console.debug('[FIRESIDE] Adding streaming uid to new host');
			hosts.value.push({
				user: user,
				needsPermissionToView: payload.is_unlisted,
				isLive: payload.is_live,
				uids: [payload.streaming_uid],
			} as FiresideRTCHost);
		}

		// Vue does not pick up the change to uids for existing hosts, and I
		// can't be assed to figure out what in the world i need to wrap in a
		// reactive() to make it work.
		triggerRef(hosts);
	}

	function _onStickerPlacement(payload: StickerPlacementPayload) {
		console.debug('[FIRESIDE] Grid sticker placement received.', payload, payload.streak);

		const { rtc, stickerTargetController, fireside, user } = firesideController;

		const placement = new StickerPlacement(payload.sticker_placement);
		const {
			sticker,
			target_data: { host_user_id },
		} = placement;

		setStickerStreak(drawerStore, sticker, payload.streak);

		const wasMyPlacement = payload.user_id === user.value?.id;

		// Stickers and counts get added automatically when we place them
		// ourselves. Return early so we don't do it twice.
		if (wasMyPlacement) {
			return;
		}

		const focusedUserId = rtc.value?.focusedUser?.userModel?.id;

		if (focusedUserId === host_user_id) {
			// Display the live sticker only if we're watching the target host.
			addStickerToTarget(stickerTargetController, placement);
		}
		onFiresideStickerPlaced.next(placement);

		fireside.addStickerToCount(sticker);
	}

	return c;
}
