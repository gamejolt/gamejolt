import { shallowReadonly } from 'vue';
import { CommentModel } from '../../../_common/comment/comment-model';
import { getModel } from '../../../_common/model/model-store.service';
import {
	RealtimeReactionsPayload,
	updateReactionCount,
} from '../../../_common/reaction/reaction-count';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridCommentChannel = ReturnType<typeof createGridCommentChannel>;

interface UpdateCommentReactionPayload {
	deltas: RealtimeReactionsPayload[];
	comment_id: number;
}

export interface CommentTopicPayload {
	resource: string;
	resource_id: number;
	parent_comment_id: number;
}

export function createGridCommentChannel(client: GridClient, { userId }: { userId: number }) {
	const { socketController } = client;

	const channelController = createSocketChannelController(`comment`, socketController);
	channelController.listenTo('update-reactions', _onUpdateReaction);

	const joinPromise = channelController.join();

	function _onUpdateReaction(payload: UpdateCommentReactionPayload) {
		const comment = getModel(CommentModel, payload.comment_id);
		if (!comment) {
			return;
		}

		for (const data of payload.deltas) {
			updateReactionCount(
				{
					currentUserId: userId,
					model: comment,
				},
				{
					deltaInc: data.delta_inc,
					deltaDec: data.delta_dec,
				},
				{
					emojiId: data.emoji_id,
					emojiImgUrl: data.emoji_img_url,
					emojiPrefix: data.emoji_prefix,
					emojiShortName: data.emoji_short_name,
				}
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
