import { Presence } from 'phoenix';
import { computed, markRaw, ref, shallowReadonly } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { Background } from '../../../_common/background/background.model';
import { ContentDocument } from '../../../_common/content/content-document';
import { ContentObject } from '../../../_common/content/content-object';
import { MarkObject } from '../../../_common/content/mark-object';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { StickerPlacement } from '../../../_common/sticker/placement/placement.model';
import {
	ChatClient,
	isInChatRoom,
	processNewChatOutput,
	setChatRoom,
	setTimeSplit,
	setupChatRoom,
	updateChatRoomLastMessageOn,
} from './client';
import { ChatMessage } from './message';
import { ChatRoom } from './room';
import { ChatUser } from './user';

export type ChatRoomChannel = Awaited<ReturnType<typeof createChatRoomChannel>>;

interface JoinPayload {
	room: unknown;
	messages: unknown[];
}

interface RoomPresence {
	metas: { phx_ref: string; typing: boolean }[];
	user: unknown;
}

interface MemberAddPayload {
	members: unknown[];
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

export async function createChatRoomChannel(
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
	}
) {
	const { socketController } = client;
	const { roomId, instanced, afterMemberKick } = options;

	// This is because the join set its up async, but all the functionality that
	// attaches to this channel will be called after the room is set up. So we
	// can just safely access it.
	const _room = ref<ChatRoom>();
	const room = computed(() => _room.value!);

	let _freezeMessageLimitRemovals = false;
	let _queuedMessageLimit: number | undefined = undefined;

	const channelController = createSocketChannelController(`room:${roomId}`, socketController);
	channelController.listenTo('message', _onMsg);
	channelController.listenTo('user_updated', _onUserUpdated);
	channelController.listenTo('message_update', _onUpdateMsg);
	channelController.listenTo('message_remove', _onRemoveMsg);
	channelController.listenTo('member_leave', _onMemberLeave);
	channelController.listenTo('owner_sync', _onOwnerSync);
	channelController.listenTo('member_add', _onMemberAdd);
	channelController.listenTo('room_update', _onRoomUpdate);
	channelController.listenTo('kick_member', _onMemberKicked);

	const { channel } = channelController;
	channel.onClose(() => {
		if (!isInChatRoom(client, roomId)) {
			return;
		}

		if (!instanced) {
			setChatRoom(client, undefined);
		}

		delete client.roomMembers[roomId];
		delete client.messages[roomId];
	});

	const presence = markRaw(new Presence(channel));
	presence.onJoin(_onUserJoin);
	presence.onLeave(_onUserLeave);
	presence.onSync(() => _syncPresentUsers(presence));

	const c = shallowReadonly({
		channelController,
		roomId,
		instanced,
		room,

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
	});

	// If we're not an instanced room, we only want to allow joining a single
	// one. So we save our room as the one that we're polling and then check
	// after join to make sure that we didn't change.
	if (!instanced) {
		client.pollingRoomId = roomId;
	}

	await channelController.join({
		async onJoin(response: JoinPayload) {
			if (!instanced) {
				if (client.pollingRoomId !== roomId) {
					throw new Error(`Not polling our room anymore.`);
				}

				client.pollingRoomId = -1;
			}

			client.roomChannels[roomId] = markRaw(c);

			_room.value = new ChatRoom(response.room);

			const messages = response.messages.map((i: ChatMessage) => new ChatMessage(i));
			messages.reverse();
			setupChatRoom(client, room.value, messages);
		},
	});

	function _onMsg(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

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
			const hasQueuedMessages = client.messageQueue.some(i => i.room_id === message.room_id);
			const hasReceivedMessage = client.messages[message.room_id].some(
				i => i.id === message.id
			);
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
		const messages = client.messages[roomId];
		const removalCount = messages.length - maxMessages;
		if (removalCount <= 0) {
			return;
		}

		messages.splice(0, removalCount);
		if (messages.length > 0) {
			setTimeSplit(client, roomId, messages[0]);
		}
	}

	function _onUserUpdated(data: Partial<ChatUser>) {
		const updatedUser = new ChatUser(data);
		if (room.value.isGroupRoom) {
			if (isInChatRoom(client, roomId)) {
				client.roomMembers[roomId].update(updatedUser);
			}

			room.value.updateRoleForUser(updatedUser);

			// Sync the user update to the list of messages.
			for (const message of client.messages[roomId]) {
				if (message.user.id === updatedUser.id) {
					Object.assign(message.user, updatedUser);
				}
			}
		}
	}

	function _onRemoveMsg(data: { id: number }) {
		if (!room.value) {
			return;
		}

		const roomMessages = client.messages[roomId];

		// Get the two surrounding messages of the removed message.
		const removedMessageIndex = roomMessages.findIndex(i => i.id === data.id);
		const previousMessage =
			removedMessageIndex === 0 ? null : roomMessages[removedMessageIndex - 1];
		const nextMessage =
			removedMessageIndex === roomMessages.length - 1
				? null
				: roomMessages[removedMessageIndex + 1];

		arrayRemove(client.messages[roomId], i => i.id === data.id);

		// Recalc the time split of the surrounding messages. If for example the
		// removed message was the first in a batch of user messages, removing
		// it would get rid of the split between that user and the previous one.
		// Resetting the time split on the next (now first in batch) message
		// shows the user header on that message.
		if (previousMessage) {
			setTimeSplit(client, roomId, previousMessage);
		}
		if (nextMessage) {
			setTimeSplit(client, roomId, nextMessage);
		}
	}

	function _onUpdateMsg(data: Partial<ChatMessage>) {
		if (!room.value) {
			return;
		}

		const edited = new ChatMessage(data);

		const index = client.messages[roomId].findIndex(msg => msg.id === data.id);
		const message = client.messages[roomId][index];

		message.content = edited.content;
		message.edited_on = edited.edited_on;
	}

	function _onUserJoin(presenceId: string, currentPresence: RoomPresence | undefined) {
		// If this is the first user presence from a device.
		if (!currentPresence && client.roomMembers[roomId]) {
			const userId = +presenceId;
			client.roomMembers[roomId].online(userId);
		}
	}

	function _onUserLeave(presenceId: string, currentPresence: RoomPresence | undefined) {
		// If the user has left all devices.
		if (currentPresence?.metas.length === 0 && client.roomMembers[roomId]) {
			const userId = +presenceId;
			client.roomMembers[roomId].offline(userId);
		}
	}

	function _onMemberLeave(data: MemberLeavePayload) {
		const roomMembers = client.roomMembers[roomId];

		if (roomMembers) {
			roomMembers.remove(data.user_id);
		}
		arrayRemove(room.value.members, i => i.id === data.user_id);
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
		for (const message of client.messages[roomId]) {
			if (message.user.id === data.user_id) {
				message.content = json;
			}
		}

		afterMemberKick?.(data);
	}

	function _onMemberAdd(data: MemberAddPayload) {
		const roomMembers = client.roomMembers[roomId];

		for (const member of data.members) {
			const user = new ChatUser(member);

			if (roomMembers) {
				roomMembers.add(user);
			}

			room.value.members.push(user);
			room.value.updateRoleForUser(user);
		}
	}

	function _onRoomUpdate(json: Partial<ChatRoom>) {
		const { title, background } = json;
		room.value.title = title || '';
		room.value.background = background ? new Background(background) : undefined;
	}

	function _onOwnerSync(data: OwnerSyncPayload) {
		room.value.owner_id = data.owner_id;
	}

	function _syncPresentUsers(presence: Presence) {
		if (!room.value) {
			return;
		}

		const roomMembers = client.roomMembers[room.value.id];

		roomMembers.doBatchWork(() => {
			presence.list((id: string, roomPresence: RoomPresence) => {
				const user = roomMembers.get(+id) ?? new ChatUser(roomPresence.user);
				user.typing = roomPresence.metas.some(meta => meta.typing);
				roomMembers.update(user);
				roomMembers.online(+id);
			});
		});
	}

	// TODO: why is this here and not in the chat client?
	function processNewRoomMessage(message: ChatMessage) {
		const alreadyReceivedMessage = client.messages[message.room_id].some(
			i => i.id === message.id
		);
		if (alreadyReceivedMessage) {
			return;
		}

		processNewChatOutput(client, roomId, [message], false);
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
			messages: unknown[];
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
		interface Payload {
			stickerPlacement: StickerPlacement;
		}

		return channelController.push<Payload>(
			'place_sticker',
			{
				...stickerData,
				host_user_id: targetUserId,
			},
			// Just in case they get disconnected (or bad data causes it to
			// error out)
			5_000
		);
	}

	return c;
}
