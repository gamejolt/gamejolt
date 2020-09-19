import { ChatRoom } from './room';
import { ChatUser } from './user';

export class ChatUserCollection {
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';

	onlineCount = 0;
	offlineCount = 0;

	private collection_: ChatUser[] = [];

	get collection() {
		// Sorting is done inplace, so let's make a new wrapping array.
		const collection = [...this.collection_];

		if (this.type === ChatUserCollection.TYPE_FRIEND) {
			collection.sort((a, b) => {
				return b.last_message_on - a.last_message_on;
			});
		} else {
			collection.sort((a, b) => {
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

		return collection;
	}

	constructor(public type: 'friend' | 'room', users: any[] = []) {
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
			if (user.isOnline) {
				return 0;
			}
		}

		return 1;
	}
}
