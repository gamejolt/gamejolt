import { reactive } from '@vue/runtime-core';
import { Channel, Socket } from 'phoenix';
import { markRaw } from 'vue';
import { Fireside } from '../../../_common/fireside/fireside.model';
import { User } from '../../../_common/user/user.model';

export const EVENT_UPDATE = 'update';
export const EVENT_STREAMING_UID = 'streaming-uid';
export const EVENT_STICKER_PLACEMENT = 'sticker-placement';

interface FiresideChannelConfig {
	fireside: Fireside;
	socket: Socket;
	user: User | null;
	authToken: string;
}

class FiresideChannelInternal {
	constructor(public readonly fireside: Fireside, public readonly socket: Socket) {}

	_socketChannel!: Channel;
	get socketChannel() {
		return this._socketChannel;
	}
}

/**  Use {@link createFiresideChannel} to construct a new channel. */
export abstract class FiresideChannel extends FiresideChannelInternal {}

export function createFiresideChannel({
	fireside,
	socket,
	user,
	authToken,
}: FiresideChannelConfig) {
	const channel = reactive(new FiresideChannelInternal(fireside, socket)) as FiresideChannel;

	const params = user
		? { auth_token: authToken, user_id: user.id.toString() }
		: { auth_token: authToken };

	channel._socketChannel = markRaw(new Channel('fireside:' + fireside.hash, params, socket));
	(socket as any).channels.push(channel.socketChannel);

	return channel;
}
