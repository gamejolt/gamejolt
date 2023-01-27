import { markRaw, shallowReadonly, triggerRef } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { createLogger } from '../../../utils/logging';
import { Background } from '../../../_common/background/background.model';
import { FiresideChatSettings } from '../../../_common/fireside/chat/chat-settings.model';
import { FiresideRTCHost } from '../../../_common/fireside/rtc/rtc';
import {
	createSocketChannelController,
	SocketChannelController,
} from '../../../_common/socket/socket-controller';
import { StickerPlacement } from '../../../_common/sticker/placement/placement.model';
import {
	onFiresideStickerPlaced,
	setStickerStreak,
	StickerStore,
} from '../../../_common/sticker/sticker-store';
import { addStickerToTarget } from '../../../_common/sticker/target/target-controller';
import { User } from '../../../_common/user/user.model';
import {
	FiresideController,
	StreamingInfoPayload,
	updateFiresideData,
} from '../fireside/controller/controller';
import { GridClient } from './client.service';

// We need to manually specify since there's a recursive definition.
export type GridFiresideChannel = Readonly<{
	channelController: SocketChannelController;
	firesideHash: string;
	joinPromise: Promise<void>;
	pushUpdateChatSettings: (
		chatSettings: FiresideChatSettings
	) => Promise<UpdateChatSettingsPayload>;
	pushUpdateHost: (data: UpdateHostData) => Promise<any>;
	leave: () => void;
}>;

interface UpdateHostData {
	backgroundId?: number | null;
}

interface JoinPayload {
	server_time: number;
	chat_settings: unknown;
	slow_mode_last_message_on: number;
	host_data: [{ user_id: number; background?: any }];
}

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

interface UpdateChatSettingsPayload {
	settings: unknown;
}

interface HostUpdatePayload {
	user_id: number;
	background?: any;
}

export function createGridFiresideChannel(
	client: GridClient,
	firesideController: FiresideController,
	options: { firesideHash: string; stickerStore: StickerStore }
): GridFiresideChannel {
	const { socketController } = client;
	const { chatSettings, assignHostBackgroundData } = firesideController;
	const { firesideHash, stickerStore } = options;

	const logger = createLogger('Fireside');

	const channelController = createSocketChannelController(
		`fireside:${firesideHash}`,
		socketController
	);

	channelController.listenTo('update', _onUpdate);
	channelController.listenTo('streaming-uid', _onStreamingUid);
	channelController.listenTo('sticker-placement', _onStickerPlacement);
	channelController.listenTo('update-host', _onUpdateHost);

	const joinPromise = channelController.join({
		async onJoin(response: JoinPayload) {
			client.firesideChannels.push(markRaw(c));
			chatSettings.value.assign(response.chat_settings);

			// We need to initialize background data for all hosts.
			if (response.host_data) {
				for (const hostData of response.host_data) {
					assignHostBackgroundData(
						hostData.user_id,
						hostData.background ? new Background(hostData.background) : undefined
					);
				}
			}
		},
		onLeave() {
			arrayRemove(client.firesideChannels, i => i.firesideHash === firesideHash);
		},
	});

	const c = shallowReadonly<GridFiresideChannel>({
		channelController,
		firesideHash,
		joinPromise,

		pushUpdateChatSettings,
		pushUpdateHost,
		leave,
	});

	function leave() {
		channelController.leave();
	}

	async function _onUpdate(payload: UpdatePayload) {
		logger.info('Fireside update message:', payload);

		updateFiresideData(firesideController, {
			fireside: payload.fireside,
			chatSettings: payload.chat_settings,
			streamingInfo: payload.streaming_info,
		});
	}

	function _onStreamingUid(payload: StreamingUIDPayload) {
		logger.info('Grid streaming uid added.', payload);

		const { hosts } = firesideController;
		if (!payload.streaming_uid || !payload.user) {
			return;
		}

		const user = new User(payload.user);
		const host = hosts.value.find(host => host.user.id === user.id);
		if (host) {
			logger.info('Adding streaming uid to existing host');

			host.user = user;
			host.needsPermissionToView = payload.is_unlisted;
			host.isLive = payload.is_live;
			if (host.uids.indexOf(payload.streaming_uid) === -1) {
				host.uids.push(payload.streaming_uid);
			}
		} else {
			logger.info('Adding streaming uid to new host');
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
		logger.info('Grid sticker placement received.', payload, payload.streak);

		const { rtc, stickerTargetController, fireside, user } = firesideController;
		// Ignore placements if we don't have an RTC set up.
		if (!rtc.value) {
			logger.info(`Received grid sticker placement while we have no RTC`);
			return;
		}

		const placement = new StickerPlacement(payload.sticker_placement);
		const {
			sticker,
			target_data: { host_user_id },
		} = placement;

		setStickerStreak(stickerStore, sticker, payload.streak);

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

		fireside.addStickerToCount(sticker, payload.sticker_placement.is_charged === true);
	}

	function _onUpdateHost(payload: HostUpdatePayload) {
		logger.info('Grid host update received.', payload);

		const background = payload.background ? new Background(payload.background) : undefined;
		firesideController.assignHostBackgroundData(payload.user_id, background);
	}

	/**
	 * Used to change the chat settings for the fireside.
	 */
	function pushUpdateChatSettings(chatSettings: FiresideChatSettings) {
		return channelController.push<UpdateChatSettingsPayload>('update_chat_settings', {
			fireside_hash: firesideHash,
			allow_images: chatSettings.allow_images,
			allow_gifs: chatSettings.allow_gifs,
			allow_links: chatSettings.allow_links,
			automated_sticker_messages: chatSettings.automated_sticker_messages,
		});
	}

	function pushUpdateHost({ backgroundId }: UpdateHostData) {
		return channelController.push('update_host', {
			fireside_hash: firesideHash,
			background_id: backgroundId || null,
		});
	}

	return c;
}
