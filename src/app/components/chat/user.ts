export class ChatUser {
	id: number;
	roomId: number;
	lastMessageOn: number;
	username: string;
	displayName: string;
	imgAvatar: string;

	isOnline: boolean;
	isMutedRoom: boolean;
	isMutedGlobal: boolean;
	isMod: 'owner' | 'moderator' | false = false;
	permissionLevel: number;

	constructor(data: Partial<ChatUser> = {}) {
		Object.assign(this, data);
	}

	get url() {
		return `/@${this.username}`;
	}
}
