import { ChatUser } from './user';

export type ChatRoomType = 'pm' | 'open_group' | 'closed_group' | 'viral_group';

export class ChatRoom
{
	static readonly ROOM_PM = 'pm';
	static readonly ROOM_OPEN_GROUP = 'open_group';
	static readonly ROOM_CLOSED_GROUP = 'closed_group';
	static readonly ROOM_VIRAL_GROUP = 'viral_group';

	id: number;
	title: string;
	type: ChatRoomType;
	user?: ChatUser;
	isMod: 'owner' | 'moderator' | false = false;
	isMutedGlobal: boolean;
	isMutedRoom: boolean;

	description_compiled: string;
	description_markdown: string;

	staff: {
		permission: string;
		userId: number;
	}[];

	// lastMessageOn: string;
	// status: string;

	constructor( data: Partial<ChatRoom> = {} )
	{
		Object.assign( this, data );
	}

	get isPmRoom()
	{
		return this.type === ChatRoom.ROOM_PM;
	}

	get isPrivateRoom()
	{
		return this.type === ChatRoom.ROOM_PM
			|| this.type === ChatRoom.ROOM_CLOSED_GROUP;
	}

	get isGroupRoom()
	{
		return this.type === ChatRoom.ROOM_OPEN_GROUP
			|| this.type === ChatRoom.ROOM_CLOSED_GROUP
			|| this.type === ChatRoom.ROOM_VIRAL_GROUP;
	}
}
