import { shallowReadonly } from 'vue';
import { Comment } from '../../../_common/comment/comment-model';
import { getModel } from '../../../_common/model/model-store.service';
import {
	UpdateReactionPayload,
	updateReactionCount,
} from '../../../_common/reaction/reaction-count';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridCommentsChannel = ReturnType<typeof createGridCommentsChannel>;

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

	function _onUpdateReaction(payload: UpdateReactionPayload) {
		const comment = payload.resource_id ? getModel(Comment, payload.resource_id) : undefined;
		if (!comment) {
			return;
		}

		for (const emoji_delta of payload.deltas) {
			updateReactionCount({
				emoji_data: emoji_delta.emoji_data,
				user_deltas: emoji_delta.user_deltas,
				current_user_id: userId,
				model: comment,
			});
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
