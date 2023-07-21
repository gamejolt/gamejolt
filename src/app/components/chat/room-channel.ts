import { Presence } from 'phoenix';
import { computed, markRaw, onMounted, onUnmounted, Ref, ref, shallowReadonly, watch } from 'vue';
import { Background } from '../../../_common/background/background.model';
import { ContentDocument } from '../../../_common/content/content-document';
import { ContentObject } from '../../../_common/content/content-object';
import { MarkObject } from '../../../_common/content/mark-object';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { getModel, storeModel, storeModelList } from '../../../_common/model/model-store.service';
import { UnknownModelData } from '../../../_common/model/model.service';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { StickerPlacement } from '../../../_common/sticker/placement/placement.model';
import { arrayRemove } from '../../../utils/array';
import { CancelToken } from '../../../utils/cancel-token';
import { run } from '../../../utils/utils';
import {
	ChatClient,
	isInChatRoom,
	processNewChatOutput,
	setTimeSplit,
	updateChatRoomLastMessageOn,
} from './client';
import { ChatMessage } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';

export type ChatRoomChannel = ReturnType<typeof createChatRoomChannel>;

interface JoinPayload {
	room: UnknownModelData;
	messages: UnknownModelData[];
	fireside: UnknownModelData | null;
	streaming_users: UnknownModelData[];
}

interface RoomPresence {
	metas: { phx_ref: string; typing: boolean; username: string }[];
}

interface MemberIncPayload {
	amount: number;
}

interface MemberDecPayload {
	amount: number;
}

interface MemberAddPayload {
	members: UnknownModelData[];
}

interface MemberLeavePayload {
	user_id: number;
}

export interface ChatRoomMemberKickedPayload {
	user_id: number;
}

interface OwnerSyncPayload {
	owner_id: number;
}

export interface PlaceStickerPayload {
	stickerPlacement: StickerPlacement;
	success?: boolean;
	unlockedPack?: UnknownModelData;
}

interface StartFiresidePayload {
	fireside: UnknownModelData;
}

interface UpdateFiresidePayload {
	fireside: UnknownModelData | null;
	streaming_users: UnknownModelData[];
}

interface FiresideSocketParams {
	fireside_viewing_mode: string;
}

export function createChatRoomChannel(
	client: ChatClient,
	options: {
		roomId: number;
		/**
		 * An instanced room channel is for a room that can be opened anywhere
		 * on the site, outside of and in addition to the active chat in the
		 * chat sidebar.
		 */
		instanced: boolean;

		/**
		 * If you want to hook into the member kicked even to do some extra
		 * logic.
		 */
		afterMemberKick?: (data: ChatRoomMemberKickedPayload) => void;

		/**
		 * Fireside socket params to pass to the socket controller.
		 */
		firesideSocketParams?: FiresideSocketParams;
	}
) {
	const { socketController } = client;
	const { roomId, instanced, afterMemberKick, firesideSocketParams } = options;

	// This is because the join set its up async, but all the functionality that
	// attaches to this channel will be called after the room is set up. So we
	// can just safely access it.
	const _room = ref<ChatRoom>();
	const room = computed(() => _room.value!);

	let _freezeMessageLimitRemovals = false;
	let _queuedMessageLimit: number | undefined = undefined;

	const channelController = createSocketChannelController(
		`room:${roomId}`,
		socketController,
		firesideSocketParams
	);
	channelController.listenTo('message', _onMsg);
	channelController.listenTo('user_updated', _onUserUpdated);
	channelController.listenTo('message_update', _onUpdateMsg);
	channelController.listenTo('message_remove', _onRemoveMsg);
	channelController.listenTo('member_inc', _onMemberInc);
	channelController.listenTo('member_dec', _onMemberDec);
	channelController.listenTo('member_add', _onMemberAdd);
	channelController.listenTo('member_leave', _onMemberLeave);
	channelController.listenTo('owner_sync', _onOwnerSync);
	channelController.listenTo('room_update', _onRoomUpdate);
	channelController.listenTo('kick_member', _onMemberKicked);
	channelController.listenTo('fireside_start', _onFiresideStart);
	channelController.listenTo('fireside_update', _onFiresideUpdate);

	const { channel, isClosed } = channelController;

	const presence = markRaw(new Presence(channel));
	presence.onSync(() => _syncPresentUsers(presence));
	presence.onLeave(_syncPresenceData);

	const joinPromise = channelController.join({
		async onJoin(response: JoinPayload) {
			client.roomChannels.set(roomId, markRaw(c));
			_room.value = storeModel(ChatRoom, { chat: client, ...response.room });

			// Clear out any old messages so we don't use old data from the
			// model store.
			room.value.messages = [];

			const messages = storeModelList(ChatMessage, response.messages);
			messages.reverse();
			processNewChatOutput(room.value, messages, true);
			room.value.messagesPopulated = true;

			room.value.updateFireside(
				response.fireside ? new Fireside(response.fireside) : null,
				response.streaming_users.map(x => new ChatUser(x))
			);

			// Don't push for guests.
			if (client.currentUser && client.isFocused) {
				pushFocus();
			}
		},
		onLeave() {
			if (_room.value?.messageEditing) {
				_room.value.messageEditing = null;
			}

			client.roomChannels.delete(roomId);
		},
	});

	const c = shallowReadonly({
		channelController,
		roomId,
		instanced,
		room,
		joinPromise,

		processNewRoomMessage,
		freezeMessageLimitRemovals,
		unfreezeMessageLimitRemovals,
		pushFocus,
		pushUnfocus,
		pushMessage,
		pushMessageRemove,
		pushMessageUpdate,
		pushLoadMessages,
		pushMemberAdd,
		pushKickMember,
		pushUpdateTitle,
		pushUpdateBackground,
		pushStartTyping,
		pushStopTyping,
		pushPlaceSticker,
		pushStartFireside,
		getMemberWatchLock,
		leave,
	});

	function leave() {
		channelController.leave();
	}

	function _onMsg(data: Partial<ChatMessage>) {
		let message = getModel(ChatMessage, data.id!);
		const storedMessage = message !== undefined;
		message = storeModel(ChatMessage, data);

		// If we already stored the message before, just update its data and return.
		if (storedMessage) {
			return;
		}

		// If we receive a message from the currently logged in user on this
		// room channel, we ignore it.
		//
		// We handle this message as incoming in the chat client as a response
		// to sending the message. So as to not duplicate the message in the
		// room, ignore it here.
		if (client.currentUser && client.currentUser.id === message.user.id) {
			// The only exception is if that message was not already received,
			// and the client is not having any messages queued. This is so when
			// a user has the same room open in two windows, and they send a
			// message in one, they receive it in the other. We can safely
			// assume that they wouldn't try and use two windows to send
			// messages in the same room at the same time.
			const hasQueuedMessages = room.value.queuedMessages.length > 0;
			const hasReceivedMessage = room.value.messages.some(i => i.id === message!.id);
			if (hasQueuedMessages || hasReceivedMessage) {
				return;
			}
		}

		processNewRoomMessage(message);
	}

	function _queueMessageLimitRemoval(maxMessages: number) {
		if (_freezeMessageLimitRemovals) {
			_queuedMessageLimit = maxMessages;
		} else {
			_removeMessagesPastLimit(maxMessages);
			_queuedMessageLimit = undefined;
		}
	}

	function _removeMessagesPastLimit(maxMessages: number) {
		const { messages } = room.value;
		const removalCount = messages.length - maxMessages;
		if (removalCount <= 0) {
			return;
		}

		messages.splice(0, removalCount);
		if (messages.length > 0) {
			setTimeSplit(room.value, messages[0]);
		}
	}

	function _onUserUpdated(data: Partial<ChatUser>) {
		const updatedUser = storeModel(ChatUser, data);
		if (room.value.isGroupRoom) {
			if (isInChatRoom(client, roomId)) {
				room.value.memberCollection.updated(updatedUser);
			}

			room.value.updateRoleForUser(updatedUser);
		}
	}

	function _onRemoveMsg(data: { id: number }) {
		if (!room.value) {
			return;
		}

		const { messages } = room.value;

		// Get the two surrounding messages of the removed message.
		const removedMessageIndex = messages.findIndex(i => i.id === data.id);
		const previousMessage =
			removedMessageIndex === 0 ? null : messages[removedMessageIndex - 1];
		const nextMessage =
			removedMessageIndex === messages.length - 1 ? null : messages[removedMessageIndex + 1];

		arrayRemove(messages, i => i.id === data.id);

		// Recalc the time split of the surrounding messages. If for example the
		// removed message was the first in a batch of user messages, removing
		// it would get rid of the split between that user and the previous one.
		// Resetting the time split on the next (now first in batch) message
		// shows the user header on that message.
		if (previousMessage) {
			setTimeSplit(room.value, previousMessage);
		}
		if (nextMessage) {
			setTimeSplit(room.value, nextMessage);
		}
	}

	function _onUpdateMsg(data: Partial<ChatMessage>) {
		if (!room.value) {
			return;
		}

		// This will edit it within the room's message list.
		storeModel(ChatMessage, data);
	}

	function _onMemberInc(data: MemberIncPayload) {
		room.value.member_count += data.amount;
	}

	function _onMemberDec(data: MemberDecPayload) {
		room.value.member_count -= data.amount;
	}

	function _onMemberAdd(data: MemberAddPayload) {
		for (const member of data.members) {
			const user = storeModel(ChatUser, member);

			room.value.memberCollection.add(user);
			room.value.updateRoleForUser(user);
		}
	}

	function _onMemberLeave(data: MemberLeavePayload) {
		room.value.memberCollection.remove(data.user_id);
	}

	function _onMemberKicked(data: ChatRoomMemberKickedPayload) {
		// Generate doc for the message that contains "[removed]".
		const text = new ContentObject('text');
		text.text = '[removed]';
		const textMark = new MarkObject('code');
		text.marks.push(textMark);
		const p = new ContentObject('paragraph', [text]);
		const doc = new ContentDocument(room.value.messagesContentContext, [p]);

		const json = doc.toJson();

		// Mark all messages by the kicked member as "removed".
		for (const message of room.value.messages) {
			if (message.user.id === data.user_id) {
				message.content = json;
			}
		}

		afterMemberKick?.(data);
	}

	function _onRoomUpdate(json: Partial<ChatRoom>) {
		const { title, background } = json;
		room.value.title = title || '';
		room.value.background = background ? new Background(background) : undefined;
	}

	function _onOwnerSync(data: OwnerSyncPayload) {
		room.value.owner_id = data.owner_id;
	}

	function _onFiresideStart(data: StartFiresidePayload) {
		room.value.updateFireside(new Fireside(data.fireside), []);
	}

	function _onFiresideUpdate(data: UpdateFiresidePayload) {
		room.value.updateFireside(
			// This returns `null` when the Fireside is expired.
			data.fireside ? new Fireside(data.fireside) : null,
			data.streaming_users.map(x => new ChatUser(x))
		);
	}

	function _syncPresentUsers(presence: Presence) {
		if (!room.value) {
			return;
		}

		room.value.memberCollection.doBatchWork(() => {
			presence.list(_syncPresenceData);
		});
	}

	function _syncPresenceData(presenceId: string, roomPresence: RoomPresence | undefined) {
		if (!roomPresence) {
			return;
		}

		const userId = +presenceId;

		let isTyping = false;
		let username = null;
		for (const meta of roomPresence.metas) {
			if (meta.typing) {
				isTyping = true;
			}
			if (meta.username) {
				username = meta.username;
			}
		}

		if (isTyping && username) {
			room.value.usersTyping.set(userId, {
				username,
			});
		} else {
			room.value.usersTyping.delete(userId);
		}
	}

	// TODO: why is this here and not in the chat client?
	function processNewRoomMessage(message: ChatMessage) {
		const alreadyReceivedMessage = room.value.messages.some(i => i.id === message.id);
		if (alreadyReceivedMessage) {
			return;
		}

		processNewChatOutput(room.value, [message], false);
		updateChatRoomLastMessageOn(client, message);

		if (room.value.isFiresideRoom) {
			_queueMessageLimitRemoval(100);
		}
	}

	function freezeMessageLimitRemovals() {
		_freezeMessageLimitRemovals = true;
	}

	function unfreezeMessageLimitRemovals() {
		_freezeMessageLimitRemovals = false;
		if (_queuedMessageLimit != null) {
			_removeMessagesPastLimit(_queuedMessageLimit!);
			_queuedMessageLimit = undefined;
		}
	}

	/**
	 * Focus this particular room.
	 */
	function pushFocus() {
		return channelController.push<void>('focus', { roomId });
	}

	/**
	 * Unfocus this particular room.
	 */
	function pushUnfocus() {
		return channelController.push<void>('unfocus', { roomId });
	}

	/**
	 * Adds a new message. Will resolve with the new data for the ChatMessage
	 * model.
	 */
	function pushMessage(content: string) {
		return channelController.push<object>('message', { content });
	}

	/**
	 * Removes a particular message.
	 */
	function pushMessageRemove(messageId: number) {
		return channelController.push<void>('message_remove', { id: messageId });
	}

	/**
	 * Updates a particular message with new content.
	 */
	function pushMessageUpdate(messageId: number, content: string) {
		return channelController.push<void>('message_update', { id: messageId, content });
	}

	/**
	 * Load messages for this room.
	 */
	function pushLoadMessages(before: Date) {
		return channelController.push<{
			messages: UnknownModelData[];
		}>('load_messages', { before_date: before });
	}

	/**
	 * Adds new members to this room.
	 */
	function pushMemberAdd(members: number[]) {
		return channelController.push<void>('member_add', { member_ids: members });
	}

	/**
	 * Removes a member from this room.
	 */
	function pushKickMember(memberId: number) {
		return channelController.push<void>('kick_member', { member_id: memberId });
	}

	/**
	 * Updates the title of the room.
	 */
	function pushUpdateTitle(title: string) {
		return channelController.push<void>('update_title', { title });
	}

	/**
	 * Updates the background for the room. Passing in `null` will unset the
	 * background.
	 */
	function pushUpdateBackground(backgroundId: number | null) {
		return channelController.push<void>(
			'update_background',
			{ background_id: backgroundId },
			5_000
		);
	}

	/**
	 * Notifies that we've started typing in the room.
	 */
	function pushStartTyping() {
		return channelController.push<void>('start_typing');
	}

	/**
	 * Notifies that we've stopped typing the room.
	 */
	function pushStopTyping() {
		return channelController.push<void>('stop_typing');
	}

	/**
	 * Places a sticker on a particular target user in the room.
	 */
	function pushPlaceSticker(targetUserId: number, stickerData: any) {
		return channelController.push<PlaceStickerPayload>('place_sticker', {
			...stickerData,
			host_user_id: targetUserId,
		});
	}

	function pushStartFireside() {
		return channelController.push<StartFiresidePayload>('start_fireside');
	}

	// Currently this only works for firesides. But if you want to get
	// information from the member collection you need to first get a lock to
	// watch the most up to date data.
	const _memberWatchLocks: ChatRoomChannelLock[] = [];
	let _memberWatchCancelToken = new CancelToken();
	let _isWatchingMembers = false;

	// Call this function anytime we modify the watch lock array.
	function _memberWatchLocksChanged() {
		if (_memberWatchLocks.length > 0) {
			if (_isWatchingMembers) {
				// Nothing to do
				return;
			}

			_isWatchingMembers = true;
			run(async () => {
				interface Payload {
					members: UnknownModelData[];
				}

				const cancelToken = new CancelToken();
				_memberWatchCancelToken.cancel();
				_memberWatchCancelToken = cancelToken;
				const response = await channelController.push<Payload>('member_watch');

				// It's fine if they stop watching and this returns. We
				// still want to store it as the latest cached data. We
				// don't want to do it if they quick unwatched/watched and
				// our token is no longer active.
				if (!cancelToken.isCanceled) {
					room.value.memberCollection.replace(response.members);
				}
			});
		} else {
			if (!_isWatchingMembers) {
				// Nothing to do
				return;
			}

			// We don't clear the member list out, we keep it as is so we
			// can switch quickly back to the cached version while loading
			// again in future.

			_isWatchingMembers = false;

			if (!isClosed.value) {
				channelController.push('member_unwatch');
			}
		}
	}

	function getMemberWatchLock() {
		const newLock = new ChatRoomChannelLock(() => {
			// We compare with id so that vue wrapping it reactively doesn't
			// screw up our instance of checks.
			arrayRemove(_memberWatchLocks, i => i.id === newLock.id);
			_memberWatchLocksChanged();
		});

		_memberWatchLocks.push(newLock);
		_memberWatchLocksChanged();

		return newLock;
	}

	return c;
}

class ChatRoomChannelLock {
	static _idInc = 0;
	public readonly id = ++ChatRoomChannelLock._idInc;

	constructor(public readonly release: () => void) {}
}

/**
 * Convenience for getting a member collection and releasing the lock on
 * component unmount.
 */
export function useChatRoomMembers(room: Ref<ChatRoom | undefined>) {
	let lock: ChatRoomChannelLock | undefined;
	const mounted = ref(false);

	const roomChannel = computed(() => {
		if (!room.value?.chat) {
			return;
		}
		return room.value.chat.roomChannels.get(room.value.id);
	});
	const memberCollection = computed(() => room.value?.memberCollection);

	watch([roomChannel, mounted], () => {
		if (mounted.value && roomChannel.value) {
			if (!lock) {
				lock = roomChannel.value.getMemberWatchLock();
			}
		} else {
			cleanup();
		}
	});

	onMounted(() => {
		mounted.value = true;
	});

	onUnmounted(() => {
		mounted.value = false;
		cleanup();
	});

	function cleanup() {
		if (lock) {
			lock?.release();
			lock = undefined;
		}
	}

	return shallowReadonly({ memberCollection });
}
