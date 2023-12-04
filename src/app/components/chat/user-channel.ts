import { Presence } from 'phoenix';
import { computed, markRaw, shallowReadonly } from 'vue';
import { BackgroundModel } from '../../../_common/background/background.model';
import { importNoSSR } from '../../../_common/code-splitting';
import { useContentFocusService } from '../../../_common/content-focus/content-focus.service';
import { storeModel } from '../../../_common/model/model-store.service';
import { UnknownModelData } from '../../../_common/model/model.service';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { arrayRemove } from '../../../utils/array';
import type { TabLeaderInterface } from '../../../utils/tab-leader';
import {
	ChatClient,
	closeChatRoom,
	isInChatRoom,
	newChatNotification,
	recollectChatRoomMembers,
	updateChatRoomLastMessageOn,
} from './client';
import { ChatMessageModel } from './message';
import { ChatNotificationGrowl } from './notification-growl/notification-growl.service';
import { ChatRoomModel } from './room';
import { ChatUser } from './user';

const TabLeaderLazy = importNoSSR(async () => await import('../../../utils/tab-leader'));

export type ChatUserChannel = ReturnType<typeof createChatUserChannel>;

interface JoinPayload {
	user: UnknownModelData;
	friends: UnknownModelData[];
	notifications: Record<string, number>;
	groups: UnknownModelData[];
}

interface UserPresence {
	metas: { phx_ref: string }[];
}

interface FriendRemovePayload {
	user_id: number;
}

interface GroupAddPayload {
	room: UnknownModelData;
}

interface RoomIdPayload {
	room_id: number;
}

interface UpdateGroupTitlePayload {
	title: string;
	room_id: number;
}

export function createChatUserChannel(
	client: ChatClient,
	options: {
		userId: number;
	}
) {
	const { socketController } = client;
	const { userId } = options;

	let _tabLeader: TabLeaderInterface | null = null;
	const isTabLeader = computed(() => _tabLeader?.isLeader ?? false);

	const channelController = createSocketChannelController(`user:${userId}`, socketController);
	channelController.listenTo('friend_updated', _onFriendUpdated);
	channelController.listenTo('friend_add', _onFriendAdd);
	channelController.listenTo('friend_remove', _onFriendRemove);
	channelController.listenTo('notification', _onNotification);
	channelController.listenTo('you_updated', _onYouUpdated);
	channelController.listenTo('clear_notifications', _onClearNotifications);
	channelController.listenTo('group_add', _onGroupAdd);
	channelController.listenTo('group_leave', _onGroupLeave);
	channelController.listenTo('update_title', _onUpdateTitle);
	channelController.listenTo('update_background', _onUpdateBackground);

	const { channel } = channelController;

	const presence = markRaw(new Presence(channel));
	presence.onJoin(_onFriendJoin);
	presence.onLeave(_onFriendLeave);
	presence.onSync(() =>
		client.friendsList.doBatchWork(() => {
			presence.list((id: string, _presence: UserPresence) => {
				client.friendsList.online(+id);
			});
		})
	);

	const joinPromise = channelController.join({
		async onJoin(response: JoinPayload) {
			const { TabLeader } = await TabLeaderLazy;
			_tabLeader = new TabLeader('chat_notification_channel');
			_tabLeader.init();

			client.currentUser = storeModel(ChatUser, response.user);
			client.friendsList.replace(response.friends || []);
			client.groupRooms = (response.groups as UnknownModelData[]).map(room =>
				storeModel(ChatRoomModel, { chat: client, ...room })
			);

			client.notifications.clear();
			for (const [roomId, count] of Object.entries(response.notifications)) {
				client.notifications.set(+roomId, count);
			}
		},

		onLeave() {
			_tabLeader?.kill();
		},
	});

	const c = shallowReadonly({
		channelController,
		userId,
		isTabLeader,
		pushGroupAdd,
		pushGroupLeave,
		pushInviteAccept,
		pushInviteDecline,
		joinPromise,
	});

	function _onFriendJoin(presenceId: string, currentPresence: UserPresence | undefined) {
		// If this is the first user presence from a device.
		if (!currentPresence) {
			const userId = +presenceId;
			client.friendsList.online(userId);
			recollectChatRoomMembers(client);
		}
	}

	function _onFriendLeave(presenceId: string, currentPresence: UserPresence | undefined) {
		// If the user has left all devices.
		if (currentPresence?.metas.length === 0) {
			const userId = +presenceId;
			client.friendsList.offline(userId);
			recollectChatRoomMembers(client);
		}
	}

	function _onFriendAdd(data: Partial<ChatUser>) {
		const newFriend = storeModel(ChatUser, data);
		client.friendsList.add(newFriend);
		recollectChatRoomMembers(client);
	}

	function _onFriendRemove(data: FriendRemovePayload) {
		const userId = data.user_id;
		const friend = client.friendsList.get(userId);

		if (friend && isInChatRoom(client, friend.room_id)) {
			closeChatRoom(client);
			client.setSessionRoomId(undefined);
		}

		client.friendsList.remove(userId);
		recollectChatRoomMembers(client);
	}

	function _onFriendUpdated(data: Partial<ChatUser>) {
		const userId = data.id;

		if (userId) {
			const friend = client.friendsList.get(userId);
			data.isOnline = friend?.isOnline;
			client.friendsList.updated(storeModel(ChatUser, data));
			recollectChatRoomMembers(client);
		}
	}

	/**
	 * Gets called when they either leave a group room themselves, or if they
	 * get kicked out.
	 */
	function _onGroupLeave(data: RoomIdPayload) {
		const removed = arrayRemove(client.groupRooms, i => i.id === data.room_id);
		if (!removed.length) {
			return;
		}

		const [room] = removed;
		if (room && isInChatRoom(client, room.id)) {
			closeChatRoom(client);
			client.setSessionRoomId(undefined);
		}
	}

	function _onNotification(data: Partial<ChatMessageModel>) {
		const message = storeModel(ChatMessageModel, data);

		// We got a notification for some room.
		// If the notification key is null, set it to 1.
		newChatNotification(client, message.room_id);
		updateChatRoomLastMessageOn(client, message);

		// Play message received sound, but only on the tab leader.
		let shouldPlay = isTabLeader.value;

		// For client, only play when window is focused.
		if (GJ_IS_DESKTOP_APP) {
			shouldPlay = useContentFocusService().isWindowFocused.value;
		}
		if (shouldPlay) {
			message.playNotificationSound();
		}

		const room = client.groupRooms.find(i => i.id === message.room_id);
		ChatNotificationGrowl.show(client, message, room, isTabLeader.value);
	}

	function _onYouUpdated(data: Partial<ChatUser>) {
		client.currentUser = storeModel(ChatUser, data);
	}

	function _onClearNotifications(data: RoomIdPayload) {
		client.notifications.delete(data.room_id);
	}

	function _onGroupAdd(data: GroupAddPayload) {
		const newGroup = storeModel(ChatRoomModel, { chat: client, ...data.room });

		// Only push to room list if it's not already there.
		if (client.groupRooms.every(x => x.id !== newGroup.id)) {
			client.groupRooms.push(newGroup);
		}
	}

	function _onUpdateTitle(data: UpdateGroupTitlePayload) {
		const room = client.groupRooms.find(i => i.id === data.room_id);

		if (room) {
			room.title = data.title;
		}
	}

	function _onUpdateBackground(data: RoomIdPayload & { background?: any }) {
		const room = client.groupRooms.find(i => i.id === data.room_id);

		if (room) {
			room.background = data.background
				? storeModel(BackgroundModel, data.background)
				: undefined;
		}
	}

	/**
	 * Makes a new group and sends invites to join that room to the users in members.
	 */
	function pushGroupAdd(members: number[]) {
		return channelController.push<{ room: UnknownModelData }>('group_add', {
			member_ids: members,
		});
	}

	/**
	 * Leaves a group that we were in.
	 */
	function pushGroupLeave(roomId: number) {
		return channelController.push<void>('group_leave', { room_id: roomId });
	}

	function pushInviteAccept(inviteId: number) {
		return channelController.push<{ room_id: number }>('invite_accept', {
			invite_id: inviteId,
		});
	}

	function pushInviteDecline(inviteId: number) {
		return channelController.push<void>('invite_decline', {
			invite_id: inviteId,
		});
	}

	return c;
}
