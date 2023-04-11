import { shallowReadonly } from 'vue';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridCommentsChannel = ReturnType<typeof createGridCommentsChannel>;

interface CommentTopicPayload {
	resourceType: string;
	resourceId: number;
	parentCommentId: string;
}

interface UpdateReactionPayload {
	comment_id: number;
}

export function createGridCommentsChannel(client: GridClient, options: { userId: number }) {
	const { socketController } = client;

	const { userId } = options;
	const channelController = createSocketChannelController(`comment:${userId}`, socketController);
	console.log(`done joining?`);
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
		console.log('sending event to joltex');
		return channelController.push('follow_comment', {
			topic: `comments:${data.resourceType}:${data.resourceId}:${data.parentCommentId}`,
		});
	}
	function stopListeningToCommentsReactions(data: CommentTopicPayload) {
		return channelController.push('unfollow_comment', {
			topic: `comments:${data.resourceType}:${data.resourceId}:${data.parentCommentId}`,
		});
	}

	return c;
}
