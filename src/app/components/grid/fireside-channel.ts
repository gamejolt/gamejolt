import { Channel, Socket } from 'phoenix';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { User } from '../../../_common/user/user.model';

export const EVENT_UPDATE = 'update';

export class FiresideChannel extends Channel {
	fireside: Fireside;

	constructor(fireside: Fireside, socket: Socket, user: User, frontendCookie: string) {
		super(
			'fireside:' + fireside.hash,
			{ frontend_cookie: frontendCookie, user_id: user.id.toString() },
			socket
		);
		(socket as any).channels.push(this);

		this.fireside = fireside;
	}
}
