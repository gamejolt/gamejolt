import { ChatUser } from './user';
import { ChatRoom } from './room';
import { store } from '../../store/index';
import { ChatSiteModPermission } from './client';

export class ChatUserCollection {
	static readonly TYPE_FRIEND = 'friend';
	static readonly TYPE_ROOM = 'room';

	collection: ChatUser[] = [];
	onlineCount = 0;
	offlineCount = 0;

	private get chat() {
		return store.state.chat!;
	}

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
		return this.collection.find(user => user.roomId === roomId);
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

	mute(input: number | ChatUser, isGlobal: boolean) {
		const user = this.get(input);
		if (!user) {
			return;
		}

		if (isGlobal) {
			user.isMutedGlobal = true;
		} else {
			user.isMutedRoom = true;
		}
	}

	unmute(input: number | ChatUser, isGlobal: boolean) {
		const user = this.get(input);
		if (!user) {
			return;
		}

		if (isGlobal) {
			user.isMutedGlobal = false;
		} else {
			user.isMutedRoom = false;
		}
	}

	mod(input: number | ChatUser) {
		const user = this.get(input);
		if (!user) {
			return;
		}

		user.isMod = 'moderator';
	}

	demod(input: number | ChatUser) {
		const user = this.get(input);
		if (!user) {
			return;
		}

		user.isMod = false;
	}

	sort() {
		if (this.type === ChatUserCollection.TYPE_FRIEND) {
			this.collection.sort((a, b) => {
				return b.lastMessageOn - a.lastMessageOn;
			});

			return;
		}

		this.collection.sort((a, b) => {
			// We group users into different areas.
			// The grouped sort val takes precedence.
			const aSort = this.getSortVal(a);
			const bSort = this.getSortVal(b);
			if (aSort > bSort) {
				return 1;
			} else if (aSort < bSort) {
				return -1;
			}

			if (a.displayName.toLowerCase() > b.displayName.toLowerCase()) {
				return 1;
			} else if (a.displayName.toLowerCase() < b.displayName.toLowerCase()) {
				return -1;
			}

			return 0;
		});
	}

	private getSortVal(user: ChatUser) {
		if (this.type === ChatUserCollection.TYPE_ROOM) {
			// We sort muted users to the bottom of the list.
			if (user.isMutedRoom || user.isMutedGlobal) {
				return 4;
			}

			// Sort mods to top of room lists.
			if (user.isMod === 'owner') {
				return 0;
			} else if (user.isMod === 'moderator') {
				return 1;
			} else if (user.permissionLevel >= ChatSiteModPermission) {
				return 2;
			}
		}

		return 3;
	}
}
