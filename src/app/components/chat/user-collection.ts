import { toRaw } from 'vue';
import { arrayRemove, numberSort, stringSortRaw } from '../../../utils/array';
import { FiresideRTCHost } from '../../../_common/fireside/rtc/rtc';
import { ChatClient, isUserOnline } from './client';
import { ChatRoom } from './room';
import { ChatUser } from './user';

type RoomType = 'friend' | 'room' | 'fireside';

export class ChatUserCollection {
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';
	static readonly TYPE_FIRESIDE = 'fireside';

	onlineCount = 0;
	offlineCount = 0;

	private collection_: ChatUser[] = [];
	private byId_ = new Map<number, ChatUser>();
	private byRoomId_ = new Map<number, ChatUser>();
	private doingWork_ = false;
	private firesideHostUsers_ = new Map<number, ChatUser>();
	private firesideHosts_ = new Map<number, FiresideRTCHost>();

	get count() {
		return this.onlineCount + this.offlineCount;
	}

	get collection() {
		return this.collection_;
	}

	constructor(public chat: ChatClient, public type: RoomType, users: any[] = []) {
		if (users && users.length) {
			for (const user of users) {
				const userModel = new ChatUser(user);
				this.collection_.push(userModel);
				this.indexUser(userModel);

				if (user.isOnline) {
					++this.onlineCount;
				} else {
					++this.offlineCount;
				}
			}

			this.recollect();
		}
	}

	private indexUser(user: ChatUser) {
		this.byId_.set(user.id, user);
		if (user.room_id !== 0) {
			this.byRoomId_.set(user.room_id, user);
		}
	}

	get(input: number | ChatUser): ChatUser | undefined {
		const userId = typeof input === 'number' ? input : input.id;
		return this.byId_.get(userId);
	}

	has(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		return this.byId_.has(userId);
	}

	getByRoom(input: number | ChatRoom): ChatUser | undefined {
		const roomId = typeof input === 'number' ? input : input.id;
		return this.byRoomId_.get(roomId);
	}

	add(user: ChatUser) {
		// Don't add the same user again, update with new data instead.
		if (this.has(user)) {
			this.update(user);
			return;
		}

		this.collection_.push(user);
		this._assignFiresideHostDataToUser(user);
		this.indexUser(user);

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

		arrayRemove(this.collection_, i => i === user);
		this.byId_.delete(user.id);
		if (user.room_id !== 0) {
			this.byRoomId_.delete(user.room_id);
		}

		if (user.isOnline) {
			--this.onlineCount;
		} else {
			--this.offlineCount;
		}

		this.recollect();
	}

	assignFiresideHostData(data: FiresideRTCHost[]) {
		let needsRecollect = false;

		// Store our current host ids so we can find chat users that are no
		// longer hosts.
		const staleHostIds = new Set(this.firesideHostUsers_.keys());

		// Clear out our old set of hosts.
		this.firesideHosts_.clear();

		for (const hostData of data) {
			const freshHostId = hostData.user.id;

			// Store the new host set so we can use it when chat members get
			// added or updated.
			this.firesideHosts_.set(freshHostId, hostData);

			// User is still a host, but host data may be diffrent. Assign new
			// host data to the chat user.
			if (staleHostIds.has(freshHostId)) {
				// Remove the hostId from our old set.
				staleHostIds.delete(freshHostId);

				const validHost = this.firesideHostUsers_.get(freshHostId);
				if (validHost) {
					// Mark ourselves as needing a recollect only if the
					// relevant state doesn't match.
					if (!needsRecollect) {
						const oldHostData = validHost.firesideHost;
						needsRecollect =
							oldHostData?.isLive !== hostData.isLive &&
							oldHostData?.needsPermissionToView !== hostData.needsPermissionToView;
					}
					validHost.firesideHost = hostData;
				}
				continue;
			}

			const user = this.get(freshHostId);
			if (!user) {
				continue;
			}

			// Got a user that wasn't previously a host. Assign new host data to
			// the chat user and set them into our list of current hosts.
			user.firesideHost = hostData;
			this.firesideHostUsers_.set(freshHostId, user);
			needsRecollect = true;
		}

		if (staleHostIds.size > 0) {
			needsRecollect = true;
		}

		// Loop through our (now) invalid host ids. Remove host data from the
		// chat user and remove the chat user from our list of hosts.
		for (const invalidHostId of staleHostIds) {
			const oldHost = this.firesideHostUsers_.get(invalidHostId);
			if (oldHost) {
				oldHost.firesideHost = null;
			}
			this.firesideHostUsers_.delete(invalidHostId);
		}

		staleHostIds.clear();

		if (needsRecollect) {
			this.recollect();
		}
	}

	update(user: ChatUser) {
		const curUser = this.get(user);
		if (curUser) {
			Object.assign(curUser, user);
			this._assignFiresideHostDataToUser(curUser);
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
	 * Will resort our collection of users. We need to call this internally in
	 * reaction to changes to the users being tracked.
	 */
	recollect() {
		if (this.doingWork_) {
			return;
		}

		if (this.type === ChatUserCollection.TYPE_FRIEND) {
			this.collection_ = sortCollection(this.chat, this.collection_, 'lastMessage');
		} else if (this.type === ChatUserCollection.TYPE_FIRESIDE) {
			this.collection_ = sortCollection(this.chat, this.collection_, 'role');
		} else {
			this.collection_ = sortCollection(this.chat, this.collection_, 'title');
		}
	}

	/**
	 * Do many operations of work and then recollect afterwards to keep things
	 * sorted.
	 */
	doBatchWork(fn: () => void) {
		this.doingWork_ = true;

		try {
			fn();
		} finally {
			this.doingWork_ = false;
		}

		this.recollect();
	}

	private _assignFiresideHostDataToUser(user: ChatUser) {
		user.firesideHost = this.firesideHosts_.get(user.id) || null;
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

export function sortCollection(
	chat: ChatClient,
	collection: ChatUser[],
	mode: 'lastMessage' | 'title' | 'role'
) {
	switch (mode) {
		case 'role': {
			return toRaw(collection)
				.map(user => {
					return {
						user,
						role: SortingGroup[getSortingGroupIndex(user)],
						isFriend: chat.friendsList.has(user.id),
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
			return sortByLastMessageOn([...collection]);

		case 'title':
			return toRaw(collection)
				.map(user => ({
					user,
					sort: getSortVal(chat, user),
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

function getSortingGroupIndex(user: ChatUser | null | undefined): keyof typeof SortingGroup {
	if (!user) {
		return 'user';
	}

	if (user.role === 'owner') {
		return 'owner';
	}

	if (user.firesideHost) {
		return user.firesideHost.isLive ? 'liveFiresideHost' : 'firesideHost';
	}

	if (user.isStaff) {
		return 'staff';
	}

	return user.role ?? 'user';
}

function getSortVal(chat: ChatClient, user: ChatUser) {
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
