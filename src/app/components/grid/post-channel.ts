import { Channel, Socket } from 'phoenix';
import { FiresidePost } from '../../../_common/fireside/post/post-model';

export class PostChannel extends Channel {
	post: FiresidePost;

	constructor(post: FiresidePost, socket: Socket, params?: object) {
		super('post:' + post.id, params, socket);
		(socket as any).channels.push(this);

		this.post = post;
	}
}
