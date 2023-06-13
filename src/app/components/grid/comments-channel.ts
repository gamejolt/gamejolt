import { shallowReadonly } from 'vue';
import { Comment } from '../../../_common/comment/comment-model';
import { getModel } from '../../../_common/model/model-store.service';
import {
	EmojiDelta,
	updateReactionCountForAnEmoji,
} from '../../../_common/reaction/reaction-count';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';
export type GridCommentsChannel = ReturnType<typeof createGridCommentsChannel>;

export interface CommentTopicPayload {
	resource: string;
	resource_id: number;
	parent_comment_id: number;
}

interface UpdateCommentReactionPayload {
	deltas: EmojiDelta[];
	comment_id: number;
}

export function createGridCommentsChannel(client: GridClient, options: { userId: number }) {
	const { socketController } = client;

	const { userId } = options;
	const channelController = createSocketChannelController(`comment:${userId}`, socketController);
	channelController.listenTo('update-reactions', _onUpdateReaction);

	const joinPromise = channelController.join({
		async onJoin() {},
		onLeave() {},
	});

	const c = shallowReadonly({
		channelController,
		joinPromise,
		startListeningToCommentsReactions,
		stopListeningToCommentsReactions,
	});

	function _onUpdateReaction(payload: UpdateCommentReactionPayload) {
		const comment = getModel(Comment, payload.comment_id!);
		if (comment === undefined) {
			return;
		}
		for (const emoji_delta of payload.deltas) {
			updateReactionCountForAnEmoji(
				comment,
				emoji_delta.emoji_id,
				emoji_delta.emoji_short_name,
				emoji_delta.emoji_prefix,
				emoji_delta.emoji_img_url,
				emoji_delta.delta_inc,
				emoji_delta.delta_dec,
				userId
			);
		}
	}

	function startListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('follow_comment', data);
	}
	function stopListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('unfollow_comment', data);
	}

	return c;
}
