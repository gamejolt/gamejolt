import { Model } from '../../../model/model.service';

export class FiresidePostLike extends Model {
	declare fireside_post_id: number;
	declare user_id: number;
	declare added_on: number;
}

export function saveFiresidePostLike(like: FiresidePostLike) {
	if (like.id) {
		throw new Error(`Can't update like data`);
	}

	return like.$_save('/web/posts/like/' + like.fireside_post_id, 'firesidePostLike', {
		detach: true,
		ignorePayloadUser: true,
		data: {
			timestamp: Date.now(),
		},
	});
}

export function removeFiresidePostLike(like: FiresidePostLike) {
	return like.$_remove('/web/posts/unlike/' + like.fireside_post_id, {
		detach: true,
		ignorePayloadUser: true,
		data: {
			timestamp: Date.now(),
		},
	});
}
