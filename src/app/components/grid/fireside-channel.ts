import { Channel, Socket } from 'phoenix';
import { markRaw } from 'vue';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { User } from '../../../_common/user/user.model';

export const EVENT_UPDATE = 'update';
export const EVENT_STREAMING_UID = 'streaming-uid';
export const EVENT_STICKER_PLACEMENT = 'sticker-placement';

export class FiresideChannel {
	constructor(
		public readonly fireside: Fireside,
		public readonly socket: Socket,
		user: User | null,
		authToken: string
	) {
		const params = user
			? { auth_token: authToken, user_id: user.id.toString() }
			: { auth_token: authToken };

		this.socketChannel = markRaw(new Channel('fireside:' + fireside.hash, params, socket));
		(socket as any).channels.push(this.socketChannel);
	}

	readonly socketChannel: Channel;

	init() {
		// Nothing to do, but keeping for any event setup in future.
	}
}
