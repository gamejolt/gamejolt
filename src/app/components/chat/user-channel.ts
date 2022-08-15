import { Presence } from 'phoenix';
import { computed, markRaw, shallowReadonly } from 'vue';
import { arrayRemove } from '../../../utils/array';
import type { TabLeaderInterface } from '../../../utils/tab-leader';
import { Background } from '../../../_common/background/background.model';
import { importNoSSR } from '../../../_common/code-splitting';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import {
ChatClient,
isInChatRoom,
leaveChatRoom,
newChatNotification,
recollectChatRoomMembers,
updateChatRoomLastMessageOn
} from './client';
import { ChatMessage } from './message';
import { ChatNotificationGrowl } from './notification-growl/notification-growl.service';
import { ChatRoom } from './room';
import { ChatUser } from './user';
import { ChatUserCollection } from './user-collection';

const TabLeaderLazy = importNoSSR(async () => await import('../../../utils/tab-leader'));

export type ChatUserChannel = Awaited<ReturnType<typeof createChatUserChannel>>;

interface JoinPayload {
	user: unknown;
	friends: unknown[];
	notifications: Record<string, number>;
	groups: unknown[];
}

interface UserPresence {
	metas: { phx_ref: string }[];
}

interface FriendRemovePayload {
	user_id: number;
}

interface GroupAddPayload {
	room: unknown;
}

interface RoomIdPayload {
	room_id: number;
}

interface UpdateGroupTitlePayload {
	title: string;
	room_id: number;
}

export async function createChatUserChannel(
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
	channelController.listenTo('group_leave', _onRoomLeave);
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

	const c = shallowReadonly({
		channelController,
		userId,
		isTabLeader,
		pushGroupAdd,
		pushGroupLeave,
	});

	await channelController.join({
		async onJoin(response: JoinPayload) {
			const { TabLeader } = await TabLeaderLazy;
			_tabLeader = new TabLeader('chat_notification_channel');
			_tabLeader.init();

			client.currentUser = new ChatUser(response.user);
			client.friendsList = new ChatUserCollection(
				client,
				ChatUserCollection.TYPE_FRIEND,
				response.friends || []
			);
			client.notifications = response.notifications;
			client.groupRooms = (response.groups as unknown[]).map(
				(room: ChatRoom) => new ChatRoom(room)
			);
		},

		onLeave() {
			_tabLeader?.kill();
		},
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
		const newFriend = new ChatUser(data);
		client.friendsList.add(newFriend);
		recollectChatRoomMembers(client);
	}

	function _onFriendRemove(data: FriendRemovePayload) {
		const userId = data.user_id;
		const friend = client.friendsList.get(userId);

		if (friend && isInChatRoom(client, friend.room_id)) {
			leaveChatRoom(client);
		}

		client.friendsList.remove(userId);
		recollectChatRoomMembers(client);
	}

	function _onFriendUpdated(data: Partial<ChatUser>) {
		const userId = data.id;

		if (userId) {
			const friend = client.friendsList.get(userId);
			data.isOnline = friend?.isOnline;
			client.friendsList.update(new ChatUser(data));
			recollectChatRoomMembers(client);
		}
	}

	function _onRoomLeave(data: RoomIdPayload) {
		arrayRemove(client.groupRooms, i => i.id === data.room_id);

		if (isInChatRoom(client, data.room_id)) {
			leaveChatRoom(client, client.roomChannels[data.room_id].room.value);
		}
	}

	function _onNotification(data: Partial<ChatMessage>) {
		const message = new ChatMessage(data);

		// We got a notification for some room.
		// If the notification key is null, set it to 1.
		newChatNotification(client, message.room_id);
		updateChatRoomLastMessageOn(client, message);

		// Play message received sound, but only on the tab leader.
		let shouldPlay = isTabLeader.value;

		// For client, only play when window is focused.
		if (GJ_IS_DESKTOP_APP) {
			shouldPlay = ContentFocus.isWindowFocused;
		}
		if (shouldPlay) {
			message.playNotificationSound();
		}

		const room = client.groupRooms.find(i => i.id === message.room_id);
		ChatNotificationGrowl.show(client, message, room, isTabLeader.value);
	}

	function _onYouUpdated(data: Partial<ChatUser>) {
		const newUser = new ChatUser(data);
		client.currentUser = newUser;
	}

	function _onClearNotifications(data: RoomIdPayload) {
		delete client.notifications[data.room_id];
	}

	function _onGroupAdd(data: GroupAddPayload) {
		const newGroup = new ChatRoom(data.room);
		client.groupRooms.push(newGroup);
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
			room.background = data.background ? new Background(data.background) : undefined;
		}
	}

	/**
	 * Makes a new group with an initial set of users.
	 */
	function pushGroupAdd(members: number[]) {
		return channelController.push<{ room: unknown }>('group_add', { member_ids: members });
	}

	/**
	 * Leaves a group that we were in.
	 */
	function pushGroupLeave(roomId: number) {
		return channelController.push<void>('group_leave', { room_id: roomId });
	}

	return c;
}
