import { ChatRoom } from './room';
import { ChatUser } from './user';

export class ChatUserCollection {
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';

	collection: ChatUser[] = [];
	onlineCount = 0;
	offlineCount = 0;

	constructor(public type: 'friend' | 'room', users: any[] = []) {
		if (users && users.length) {
			for (const user of users) {
				if (user.isOnline) {
					++this.onlineCount;
				} else {
					++this.offlineCount;
				}

				this.collection.push(new ChatUser(user));
			}
		}

		this.sort();
	}

	get(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		return this.collection.find(user => user.id === userId);
	}

	getByRoom(input: number | ChatRoom) {
		const roomId = typeof input === 'number' ? input : input.id;
		return this.collection.find(user => user.room_id === roomId);
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
		} else if (user.isOnline) {
			++this.offlineCount;
		}

		this.collection.push(user);
		this.sort();
	}

	remove(input: number | ChatUser) {
		const userId = typeof input === 'number' ? input : input.id;
		const index = this.collection.findIndex(user => user.id === userId);

		if (index !== -1) {
			const user = this.collection[index];

			if (user.isOnline) {
				--this.onlineCount;
			} else {
				--this.offlineCount;
			}

			this.collection.splice(index, 1);
		} else {
			return;
		}

		this.sort();
	}

	update(user: ChatUser) {
		const curUser = this.get(user);
		if (curUser) {
			Object.assign(curUser, user);
		}

		this.sort();
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

	sort() {
		if (this.type === ChatUserCollection.TYPE_FRIEND) {
			this.collection.sort((a, b) => {
				return b.last_message_on - a.last_message_on;
			});

			return;
		}

		this.collection.sort((a, b) => {
			if (a.display_name.toLowerCase() > b.display_name.toLowerCase()) {
				return 1;
			} else if (a.display_name.toLowerCase() < b.display_name.toLowerCase()) {
				return -1;
			}

			return 0;
		});
	}
}
