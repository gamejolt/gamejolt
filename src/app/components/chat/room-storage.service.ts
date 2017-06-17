import { store } from '../../store/index';

const STORAGE_KEY = 'chat-room-storage:rooms';

export class ChatRoomStorage {
	private static storageListener?: EventListener;

	private static get chat() {
		return store.state.chat!;
	}

	static init() {
		if (!window.localStorage.getItem(STORAGE_KEY)) {
			window.localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					action: null,
					rooms: [],
				})
			);
		}

		if (!this.storageListener) {
			this.storageListener = (event: StorageEvent) =>
				this.onStorageEvent(event);
			window.addEventListener('storage', this.storageListener);
		}

		this.cleanRooms();
	}

	static destroy() {
		if (this.storageListener) {
			window.removeEventListener('storage', this.storageListener);
			this.storageListener = undefined;
		}
	}

	static getJoinedRooms(): number[] {
		return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}').rooms;
	}

	static joinRoom(roomId: number) {
		const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');

		// Don't reprocess the same command.
		if (
			data.action &&
			data.action.type === 'join' &&
			data.action.roomId === roomId
		) {
			return;
		}

		if (data.rooms.indexOf(roomId) === -1) {
			data.rooms.push(roomId);
			data.time = Date.now();
			data.action = {
				type: 'join',
				roomId: roomId,
			};

			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		}
	}

	static leaveRoom(roomId: number) {
		const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');

		// Don't reprocess the same command.
		if (
			data.action &&
			data.action.type === 'leave' &&
			data.action.roomId === roomId
		) {
			return;
		}

		const roomIndex = data.rooms.indexOf(roomId);
		if (roomIndex !== -1) {
			data.rooms = data.rooms.filter((roomId2: number) => roomId !== roomId2);
			data.time = Date.now();
			data.action = {
				type: 'leave',
				roomId: roomId,
			};

			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		}
	}

	static logout() {
		const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');

		data.time = Date.now();
		data.action = {
			type: 'log-out',
		};
		data.rooms = [];

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	private static cleanRooms() {
		const data = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');

		data.rooms = data.rooms.filter((roomId: number) => {
			if (!roomId) {
				return false;
			} else {
				return true;
			}
		});

		data.time = Date.now();
		data.action = {
			type: 'clean',
		};

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	}

	/**
	 * Gets called when localStorage is modified.
	 */
	private static onStorageEvent(storageEvent: StorageEvent) {
		if (storageEvent.key !== STORAGE_KEY) {
			return;
		}

		const roomData = JSON.parse(storageEvent.newValue || '{}');
		const action = roomData.action;

		if (!action) {
			return;
		}

		if (action.type === 'join') {
			this.chat.enterRoom(action.roomId, false);
		} else if (action.type === 'leave') {
			this.chat.leaveRoom(action.roomId);
		} else if (action.type === 'log-out') {
			this.chat.logout();
		}
	}
}
