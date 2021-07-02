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

	get count() {
		return this.onlineCount + this.offlineCount;
	}

	get collection() {
		// Sorting is done inplace, so let's make a new wrapping array.
		const collection = [...this.collection_];

		if (this.type === ChatUserCollection.TYPE_FRIEND) {
			return sortByLastMessageOn(collection);
		} else {
			return collection.sort((a, b) => {
				const aSort = this.getSortVal(a);
				const bSort = this.getSortVal(b);
				if (aSort > bSort) {
					return 1;
				} else if (aSort < bSort) {
					return -1;
				}

				if (a.display_name.toLowerCase() > b.display_name.toLowerCase()) {
					return 1;
				} else if (a.display_name.toLowerCase() < b.display_name.toLowerCase()) {
					return -1;
				}

				return 0;
			});
		}
	}

	constructor(public type: 'friend' | 'room', users: any[] = [], chatClient?: ChatClient) {
		if (users && users.length) {
			for (const user of users) {
				if (user.isOnline) {
					++this.onlineCount;
				} else {
					++this.offlineCount;
				}

				this.collection_.push(new ChatUser(user));
			}
		}

		if (chatClient) {
			this.chat = chatClient;
		}
	}

	get(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		return this.collection_.find(user => user.id === userId);
	}

	getByRoom(input: number | ChatRoom) {
		const roomId = typeof input === 'number' ? input : input.id;
		return this.collection_.find(user => user.room_id === roomId);
	}

	has(input: number | ChatUser) {
		return !!this.get(input);
	}

	add(user: ChatUser) {
		// Don't add the same user again.
		if (this.has(user)) {
			return;
		}

		if (user.isOnline) {
			++this.onlineCount;
		} else {
			++this.offlineCount;
		}

		this.collection_.push(user);
	}

	remove(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		const index = this.collection_.findIndex(user => user.id === userId);

		if (index !== -1) {
			const user = this.collection_[index];

			if (user.isOnline) {
				--this.onlineCount;
			} else {
				--this.offlineCount;
			}

			this.collection_.splice(index, 1);
		} else {
			return;
		}
	}

	update(user: ChatUser) {
		const curUser = this.get(user);
		if (curUser) {
			Object.assign(curUser, user);
		}
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
	}

	private getSortVal(user: ChatUser) {
		if (this.type === ChatUserCollection.TYPE_ROOM) {
			// Move your own user to the top of lists
			if (this.chat && this.chat.currentUser?.id === user.id) {
				return -1;
			}

			let friendOnlineStatus = null;
			if (this.chat) {
				friendOnlineStatus = isUserOnline(this.chat, user.id);
			}

			// online
			if (friendOnlineStatus) {
				return 0;
			}

			// offline
			if (friendOnlineStatus === false) {
				return 1;
			}

			// not friends
			if (friendOnlineStatus === null) {
				return 2;
			}
		}

		return 1;
	}
}

/**
 * Sorts an array of users or rooms by the last time someone has made a message
 * in the room.
 */
export function sortByLastMessageOn<T extends (ChatUser | ChatRoom)[]>(items: T): T {
	return items.sort((a, b) => b.last_message_on - a.last_message_on);
}
