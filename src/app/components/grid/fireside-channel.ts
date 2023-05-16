import { shallowReadonly } from 'vue';
import { FiresideChatSettings } from '../../../_common/fireside/chat/chat-settings.model';
import { syncFiresideHost } from '../../../_common/fireside/rtc/host';
import {
	SocketChannelController,
	createSocketChannelController,
} from '../../../_common/socket/socket-controller';
import { StickerPlacement } from '../../../_common/sticker/placement/placement.model';
import {
	StickerStore,
	onFiresideStickerPlaced,
	setStickerStreak,
} from '../../../_common/sticker/sticker-store';
import { addStickerToTarget } from '../../../_common/sticker/target/target-controller';
import { createLogger } from '../../../utils/logging';
import { FiresideController, updateFiresideData } from '../fireside/controller/controller';
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
	pushSetStream: (data: SetStreamPushPayload) => Promise<void>;
}>;

interface UpdateHostData {
	backgroundId?: number | null;
}

interface HostPayload {
	user: any;
	user_id: number;
	is_streaming_audio_mic: boolean;
	is_streaming_audio_desktop: boolean;
	is_streaming_video: boolean;
	background?: any;
}

interface SetStreamPushPayload {
	is_streaming_video: boolean;
	is_streaming_audio_mic: boolean;
	is_streaming_audio_desktop: boolean;
}

interface JoinPayload {
	server_time: number;
	chat_settings: unknown;
	slow_mode_last_message_on: number;
	hosts: HostPayload[];
}

interface StickerPlacementPayload {
	user_id: number;
	streak: number;
	sticker_placement: Partial<StickerPlacement>;
}

interface UpdatePayload {
	fireside: unknown;
	chat_settings: unknown;
}

interface UpdateChatSettingsPayload {
	settings: unknown;
}

export function createGridFiresideChannel(
	client: GridClient,
	firesideController: FiresideController,
	options: { firesideHash: string; stickerStore: StickerStore }
): GridFiresideChannel {
	const { socketController } = client;
	const { chatSettings, focusedHost } = firesideController;
	const { firesideHash, stickerStore } = options;

	const logger = createLogger('Fireside');

	const channelController = createSocketChannelController(
		`fireside:${firesideHash}`,
		socketController
	);

	channelController.listenTo('update', _onUpdate);
	channelController.listenTo('sticker-placement', _onStickerPlacement);
	channelController.listenTo('update-host', _onUpdateHost);

	const joinPromise = channelController.join({
		async onJoin(response: JoinPayload) {
			chatSettings.value.assign(response.chat_settings);

			if (response.hosts) {
				for (const hostData of response.hosts) {
					syncFiresideHost(firesideController, hostData.user_id, hostData);
				}
			}
		},
	});

	const c = shallowReadonly<GridFiresideChannel>({
		channelController,
		firesideHash,
		joinPromise,
		pushUpdateChatSettings,
		pushUpdateHost,
		pushSetStream,
	});

	async function _onUpdate(payload: UpdatePayload) {
		logger.info('Fireside update message:', payload);

		updateFiresideData(firesideController, {
			fireside: payload.fireside,
			chatSettings: payload.chat_settings,
		});
	}

	// function _onStreamingUid(payload: StreamingUIDPayload) {
	// 	logger.info('Grid streaming uid added.', payload);

	// 	const { hosts, upsertHosts } = firesideController;
	// 	if (!payload.streaming_uid || !payload.user) {
	// 		return;
	// 	}

	// 	const user = new User(payload.user);
	// 	const existingHost = hosts.value.find(host => host.userModel.id === user.id);
	// 	if (existingHost) {
	// 		logger.info('Adding streaming uid to existing host');

	// 		existingHost.userModel = user;
	// 		existingHost.needsPermissionToView = payload.is_unlisted;
	// 		if (existingHost.uids.indexOf(payload.streaming_uid) === -1) {
	// 			existingHost.uids.push(payload.streaming_uid);
	// 		}
	// 	} else {
	// 		logger.info('Adding streaming uid to new host');

	// 		upsertHosts([
	// 			...hosts.value,
	// 			{
	// 				userModel: user,
	// 				needsPermissionToView: payload.is_unlisted,
	// 				isLive: payload.is_live,
	// 				uids: [payload.streaming_uid],
	// 			},
	// 		]);
	// 	}

	// 	// Vue does not pick up the change to uids for existing hosts, and I
	// 	// can't be assed to figure out what in the world i need to wrap in a
	// 	// reactive() to make it work.
	// 	triggerRef(hosts);
	// }

	function _onStickerPlacement(payload: StickerPlacementPayload) {
		logger.info('Grid sticker placement received.', payload, payload.streak);

		const { stickerTargetController, fireside, user } = firesideController;

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

		const focusedHostId = focusedHost.value?.userModel?.id;

		if (focusedHostId === host_user_id) {
			// Display the live sticker only if we're watching the target host.
			addStickerToTarget(stickerTargetController, placement);
		}
		onFiresideStickerPlaced.next(placement);

		fireside.addStickerToCount(sticker, payload.sticker_placement.is_charged === true);
	}

	function _onUpdateHost(payload: HostPayload) {
		logger.info('Grid host update received.', payload);
		syncFiresideHost(firesideController, payload.user_id, payload);
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

	function pushSetStream(streamSettings: SetStreamPushPayload) {
		return channelController.push<void>('set_stream', {
			fireside_hash: firesideHash,
			...streamSettings,
		});
	}

	return c;
}
