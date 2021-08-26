import { Channel, Socket } from 'phoenix';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { User } from '../../../_common/user/user.model';

export const EVENT_UPDATE = 'update';

export class FiresideChannel extends Channel {
	fireside: Fireside;

	constructor(fireside: Fireside, socket: Socket, user: User | null, authToken: string) {
		const params = user
			? { auth_token: authToken, user_id: user.id.toString() }
			: { auth_token: authToken };

		super('fireside:' + fireside.hash, params, socket);
		(socket as any).channels.push(this);

		this.fireside = fireside;
	}
}
