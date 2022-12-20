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
	channelController.listenTo('member_add', _onMemberAdd);
	channelController.listenTo('member_leave', _onMemberLeave);
	channelController.listenTo('owner_sync', _onOwnerSync);
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
	});

	const presence = markRaw(new Presence(channel));
	presence.onSync(() => _syncPresentUsers(presence));
	presence.onLeave(_syncPresenceData);

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

			_room.value = new ChatRoom(client, response.room);

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
			const hasQueuedMessages = room.value.queuedMessages.length > 0;
			const hasReceivedMessage = room.value.messages.some(i => i.id === message.id);
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
		const updatedUser = new ChatUser(data);
		if (room.value.isGroupRoom) {
			if (isInChatRoom(client, roomId)) {
				room.value.memberCollection.update(updatedUser);
			}

			room.value.updateRoleForUser(updatedUser);

			// Sync the user update to the list of messages.
			for (const message of room.value.messages) {
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

		const message = room.value.messages.find(i => i.id === data.id);
		if (!message) {
			return;
		}

		const edited = new ChatMessage(data);
		message.content = edited.content;
		message.edited_on = edited.edited_on;
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

	function _onMemberAdd(data: MemberAddPayload) {
		for (const member of data.members) {
			const user = new ChatUser(member);

			room.value.memberCollection.add(user);
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

		room.value.memberCollection.doBatchWork(() => {
			presence.list(_syncPresenceData);
		});
	}

	function _syncPresenceData(presenceId: string, roomPresence: RoomPresence | undefined) {
		if (!roomPresence) {
			return;
		}

		const { memberCollection } = room.value;
		const user = memberCollection.get(+presenceId);
		if (!user) {
			return;
		}

		// We currently only sync the typing status.
		user.typing = roomPresence.metas.some(i => i.typing);
		memberCollection.update(user);
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
