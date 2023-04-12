import { shallowReadonly } from 'vue';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridCommentsChannel = ReturnType<typeof createGridCommentsChannel>;

export interface CommentTopicPayload {
	resource: string;
	resource_id: number;
	parent_comment_id: number;
}

interface UpdateReactionPayload {
	comment_id: number;
}

export function createGridCommentsChannel(client: GridClient, options: { userId: number }) {
	const { socketController } = client;

	const { userId } = options;
	const channelController = createSocketChannelController(`comment:${userId}`, socketController);
	channelController.listenTo('update-reaction', _onUpdateReaction);

	const joinPromise = channelController.join({
		async onJoin() {
			console.log('commentsChannel: joined comments channel');
		},
		onLeave() {
			console.log('commentsChannel: left comments channel');
		},
	});

	const c = shallowReadonly({
		channelController,
		joinPromise,
		startListeningToCommentsReactions,
		stopListeningToCommentsReactions,
	});

	function _onUpdateReaction(payload: UpdateReactionPayload) {
		console.log('commentsChannel: getting update-reaction event', payload);
	}

	function startListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('follow_comment', data);
	}
	function stopListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('unfollow_comment', data);
	}

	return c;
}
