import { inject, InjectionKey, provide, toRaw } from 'vue';
import { arrayRemove, numberSort, stringSortRaw } from '../../../utils/array';
import { FiresideRTCHost } from '../../../_common/fireside/rtc/rtc';
import { storeModel } from '../../../_common/model/model-store.service';
import { ChatClient, isUserOnline } from './client';
import { ChatRoom } from './room';
import { ChatUser } from './user';

type RoomType = 'friend' | 'room' | 'fireside';

const Key: InjectionKey<ChatUserCollection> = Symbol('chat-user-collection');

export function provideChatUserCollection(c: ChatUserCollection) {
	return provide(Key, c);
}

export function useChatUserCollection() {
	return inject(Key);
}

export class ChatUserCollection {
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';
	static readonly TYPE_FIRESIDE = 'fireside';

	onlineCount = 0;
	offlineCount = 0;

	private _users: ChatUser[] = [];
	private _byId = new Map<number, ChatUser>();
	private _byRoomId = new Map<number, ChatUser>();
	private _doingWork = false;
	private _firesideHosts = new Map<number, FiresideRTCHost>();

	get count() {
		return this._users.length;
	}

	get users() {
		return this._users;
	}

	constructor(
		public readonly chat: ChatClient,
		public readonly type: RoomType,
		users: any[] = []
	) {
		this.doBatchWork(() => {
			this._addAllUsers(users);
		});
	}

	/**
	 * Use this to fully replace the list of users we're tracking.
	 */
	replace(newUsers: any[]) {
		this.doBatchWork(() => {
			this.users.splice(0, Infinity);
			this._byId.clear();
			this._byRoomId.clear();

			this._addAllUsers(newUsers);
			// We keep the fireside host data since that's managed outside of
			// this class.
		});
	}

	private _addAllUsers(users: any[]) {
		if (!users || !users.length) {
			return;
		}

		for (const user of users) {
			const userModel = storeModel(ChatUser, user);
			this._users.push(userModel);
			this._indexUser(userModel);

			if (user.isOnline) {
				++this.onlineCount;
			} else {
				++this.offlineCount;
			}
		}
	}

	private _indexUser(user: ChatUser) {
		this._byId.set(user.id, user);
		if (user.room_id !== 0) {
			this._byRoomId.set(user.room_id, user);
		}
	}

	get(input: number | ChatUser): ChatUser | undefined {
		const userId = typeof input === 'number' ? input : input.id;
		return this._byId.get(userId);
	}

	has(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		return this._byId.has(userId);
	}

	getByRoom(input: number | ChatRoom): ChatUser | undefined {
		const roomId = typeof input === 'number' ? input : input.id;
		return this._byRoomId.get(roomId);
	}

	getFiresideHost(input: number | ChatUser): FiresideRTCHost | undefined {
		const userId = typeof input === 'number' ? input : input.id;
		return this._firesideHosts.get(userId);
	}

	add(user: ChatUser) {
		// Don't add the same user again, update with new data instead.
		if (this.has(user)) {
			this.updated(user);
			return;
		}

		this._users.push(user);
		this._indexUser(user);

		if (user.isOnline) {
			++this.onlineCount;
		} else {
			++this.offlineCount;
		}

		this.recollect();
	}

	remove(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		const user = this.get(userId);
		if (!user) {
			return;
		}

		arrayRemove(this._users, i => i === user);
		this._byId.delete(user.id);
		if (user.room_id !== 0) {
			this._byRoomId.delete(user.room_id);
		}

		if (user.isOnline) {
			--this.onlineCount;
		} else {
			--this.offlineCount;
		}

		this.recollect();
	}

	assignFiresideHostData(data: FiresideRTCHost[]) {
		this.doBatchWork(() => {
			this._firesideHosts.clear();

			for (const hostData of data) {
				const freshHostId = hostData.user.id;

				// Store the new host set so we can use it when chat members get
				// added or updated.
				this._firesideHosts.set(freshHostId, hostData);
			}
		});
	}

	updated(user: ChatUser) {
		const curUser = this.get(user);
		if (curUser) {
			this.recollect();
		}
		return curUser;
	}

	online(input: number | ChatUser) {
		const user = this.get(input);
		if (!user) {
			return;
		}
		// Were they previously offline?
		if (!user.isOnline) {
			--this.offlineCount;
			++this.onlineCount;
		}
		user.isOnline = true;
		this.recollect();
	}

	offline(input: number | ChatUser) {
		const user = this.get(input);
		if (!user) {
			return;
		}
		// Were they previously online?
		if (user.isOnline) {
			++this.offlineCount;
			--this.onlineCount;
		}
		user.isOnline = false;
		this.recollect();
	}

	/**
	 * Do many operations of work and then recollect afterwards to keep things
	 * sorted.
	 */
	doBatchWork(fn: () => void) {
		this._doingWork = true;

		try {
			fn();
		} finally {
			this._doingWork = false;
		}

		this.recollect();
	}

	/**
	 * Will resort our collection of users. We need to call this internally in
	 * reaction to changes to the users being tracked.
	 */
	recollect() {
		if (this._doingWork) {
			return;
		}

		if (this.type === ChatUserCollection.TYPE_FRIEND) {
			this._users = this._sortCollection('lastMessage');
		} else if (this.type === ChatUserCollection.TYPE_FIRESIDE) {
			this._users = this._sortCollection('role');
		} else {
			this._users = this._sortCollection('title');
		}
	}

	private _sortCollection(mode: 'lastMessage' | 'title' | 'role') {
		switch (mode) {
			case 'role': {
				return toRaw(this._users)
					.map(user => {
						return {
							user,
							role: SortingGroup[
								_getSortingGroupIndex(user, this.getFiresideHost(user))
							],
							isFriend: this.chat.friendsList.has(user.id),
							lowercaseDisplayName: user.display_name.toLowerCase(),
						};
					})
					.sort((a, b) => {
						const roleDiff = numberSort(a.role, b.role);
						if (roleDiff !== 0) {
							return roleDiff;
						}

						if (a.isFriend !== b.isFriend) {
							return a.isFriend ? -1 : 1;
						}

						return stringSortRaw(a.lowercaseDisplayName, b.lowercaseDisplayName);
					})
					.map(i => i.user);
			}

			case 'lastMessage':
				return sortByLastMessageOn([...this._users]);

			case 'title':
				return toRaw(this._users)
					.map(user => ({
						user,
						sort: _getSortVal(this.chat, user),
						lowercaseDisplayName: user.display_name.toLowerCase(),
					}))
					.sort((a, b) => {
						if (a.sort > b.sort) {
							return 1;
						} else if (a.sort < b.sort) {
							return -1;
						} else {
							return stringSortRaw(a.lowercaseDisplayName, b.lowercaseDisplayName);
						}
					})
					.map(i => i.user);
		}
	}
}

const SortingGroup = {
	owner: 0,
	liveFiresideHost: 1,
	firesideHost: 2,
	moderator: 3,
	staff: 4,
	user: 5,
} as const;

function _getSortingGroupIndex(
	user: ChatUser | null | undefined,
	firesideHost: FiresideRTCHost | undefined
): keyof typeof SortingGroup {
	if (!user) {
		return 'user';
	}

	if (user.role === 'owner') {
		return 'owner';
	}

	if (firesideHost) {
		return firesideHost.isLive ? 'liveFiresideHost' : 'firesideHost';
	}

	if (user.isStaff) {
		return 'staff';
	}

	return user.role ?? 'user';
}

function _getSortVal(chat: ChatClient, user: ChatUser) {
	// Move your own user to the top of lists
	if (chat?.currentUser?.id === user.id) {
		return -1;
	}

	// Room owners and mods are at the top of lists.
	const roomStatus = user.role;
	if (roomStatus === 'owner') {
		return 0;
	} else if (roomStatus === 'moderator') {
		return 1;
	}

	// Your friends show after that.
	let friendOnlineStatus = null;
	if (chat) {
		friendOnlineStatus = isUserOnline(chat, user.id);
	}

	if (friendOnlineStatus === true) {
		// online
		return 2;
	} else if (friendOnlineStatus === false) {
		// offline
		return 3;
	} else if (friendOnlineStatus === null) {
		// not friends
		return 4;
	}

	return 5;
}

/**
 * Sorts an array of users or rooms by the last time someone has made a message
 * in the room.
 */
export function sortByLastMessageOn<T extends (ChatUser | ChatRoom)[]>(items: T): T {
	return items.sort((a, b) => b.last_message_on - a.last_message_on);
}
