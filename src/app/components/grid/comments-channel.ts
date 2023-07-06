import { shallowReadonly } from 'vue';
import { Comment } from '../../../_common/comment/comment-model';
import { getModel } from '../../../_common/model/model-store.service';
import { EmojiDelta, updateReactionCount } from '../../../_common/reaction/reaction-count';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridCommentsChannel = ReturnType<typeof createGridCommentsChannel>;

interface UpdateCommentReactionPayload {
	deltas: EmojiDelta[];
	comment_id: number;
}

export interface CommentTopicPayload {
	resource: string;
	resource_id: number;
	parent_comment_id: number;
}

export function createGridCommentsChannel(client: GridClient, { userId }: { userId: number }) {
	const { socketController } = client;

	const channelController = createSocketChannelController(`comment:${userId}`, socketController);
	channelController.listenTo('update-reactions', _onUpdateReaction);

	const joinPromise = channelController.join();

	function _onUpdateReaction(payload: UpdateCommentReactionPayload) {
		const comment = getModel(Comment, payload.comment_id);
		if (!comment) {
			return;
		}

		for (const emojiDelta of payload.deltas) {
			updateReactionCount(
				{
					current_user_id: userId,
					model: comment,
				},
				emojiDelta,
				emojiDelta
			);
		}
	}

	function startListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('follow_comment', data);
	}
	function stopListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('unfollow_comment', data);
	}

	return shallowReadonly({
		channelController,
		joinPromise,
		startListeningToCommentsReactions,
		stopListeningToCommentsReactions,
	});
}
