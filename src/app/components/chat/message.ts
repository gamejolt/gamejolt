import { ChatUser } from './user';

export type ChatMessageType = 0 | 1;

export class ChatMessage
{
	static readonly TypeNormal = 0;
	static readonly TypeSystem = 1;

	id: number;
	type: ChatMessageType;
	userId: number;
	user: ChatUser;
	roomId: number;
	contentRaw: string;
	content: string;
	loggedOn: Date;
	combine?: boolean;
	dateSplit?: boolean;

	// Used for rendering.
	_collapsable = false;
	_expanded = false;

	constructor( data: Partial<ChatMessage> = {} )
	{
		Object.assign( this, data );

		if ( data.user ) {
			this.user = new ChatUser( data.user );
		}
	}
}
