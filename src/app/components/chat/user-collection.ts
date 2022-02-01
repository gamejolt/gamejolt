import { arrayRemove } from '../../../utils/array';
import { ChatClient, isUserOnline } from './client';
import { ChatRoom } from './room';
import { ChatUser } from './user';

export class ChatUserCollection {
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';

	chat: ChatClient | null = null;
	onlineCount = 0;
	offlineCount = 0;

	private collection_: ChatUser[] = [];
	private byId_: Record<number, ChatUser> = {};
	private byRoomId_: Record<number, ChatUser> = {};
	private doingWork_ = false;

	get count() {
		return this.onlineCount + this.offlineCount;
	}

	get collection() {
		return this.collection_;
	}

	constructor(public type: 'friend' | 'room', users: any[] = [], chatClient?: ChatClient) {
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

		if (chatClient) {
			this.chat = chatClient;
		}
	}

	private indexUser(user: ChatUser) {
		this.byId_[user.id] = user;
		if (user.room_id !== 0) {
			this.byRoomId_[user.room_id] = user;
		}
	}

	get(input: number | ChatUser): ChatUser | undefined {
		const userId = typeof input === 'number' ? input : input.id;
		return this.byId_[userId];
	}

	getByRoom(input: number | ChatRoom): ChatUser | undefined {
		const roomId = typeof input === 'number' ? input : input.id;
		return this.byRoomId_[roomId];
	}

	has(input: number | ChatUser) {
		return !!this.get(input);
	}

	add(user: ChatUser) {
		// Don't add the same user again, update with new data instead.
		if (this.has(user)) {
			this.update(user);
			return;
		}

		this.collection_.push(user);
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
		delete this.byId_[user.id];
		if (user.room_id !== 0) {
			delete this.byRoomId_[user.room_id];
		}

		if (user.isOnline) {
			--this.onlineCount;
		} else {
			--this.offlineCount;
		}

		this.recollect();
	}

	update(user: ChatUser) {
		const curUser = this.get(user);
		if (curUser) {
			Object.assign(curUser, user);
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
			sortCollection(this.chat, this.collection_, 'lastMessage');
		} else {
			sortCollection(this.chat, this.collection_, 'title');
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
}

function sortCollection(
	chat: ChatClient | null,
	collection: ChatUser[],
	mode: 'lastMessage' | 'title'
) {
	switch (mode) {
		case 'lastMessage':
			sortByLastMessageOn(collection);
			break;

		case 'title':
			collection.sort((a, b) => {
				if (chat) {
					const aSort = getSortVal(chat, a);
					const bSort = getSortVal(chat, b);
					if (aSort > bSort) {
						return 1;
					} else if (aSort < bSort) {
						return -1;
					}
				}

				const aName = a.display_name.toLowerCase();
				const bName = b.display_name.toLowerCase();
				if (aName > bName) {
					return 1;
				} else if (aName < bName) {
					return -1;
				}

				return 0;
			});
			break;
	}
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
