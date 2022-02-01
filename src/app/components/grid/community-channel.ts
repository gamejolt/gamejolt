import { Channel, Socket } from 'phoenix';
import { markRaw } from 'vue';
import { Community } from '../../../_common/community/community.model';

export class CommunityChannel {
	constructor(
		public readonly community: Community,
		public readonly socket: Socket,
		params?: object
	) {
		this.socketChannel = markRaw(new Channel('community:' + community.id, params, socket));
		(socket as any).channels.push(this.socketChannel);
	}

	readonly socketChannel: Channel;

	init() {
		// Nothing to do, but keeping for any event setup in future.
	}
}
