import { Presence } from 'phoenix';
import { markRaw, shallowReadonly } from 'vue';
import { createSocketChannelController } from '../../../_common/socket/socket-controller';
import { GridClient } from './client.service';

export type GridCommentsChannel = ReturnType<typeof createGridCommentsChannel>;

interface CommentsPresence {
	metas: { phx_ref: string; typing: boolean; username: string }[];
}

interface JoinPayload {}

export function createGridCommentsChannel(
	client: GridClient,
	options: { userId: number }
	//options: { commentResourceId: number; parentId: number } // commentResourceId: number; parentId: number; router: Router }
) {
	const { socketController } = client;
	//const { commentResourceId, parentId } = options;

	//const _room = ref<ChatRoom>();
	//const room = computed(() => _room.value!);

	const { userId } = options;
	const channelController = createSocketChannelController(`comment:${userId}`, socketController);

	// channelController.listenTo('typing', _);
	const { channel } = channelController;

	const presence = markRaw(new Presence(channel));
	presence.onSync(() => _syncPresentUsers(presence));
	presence.onLeave(_syncPresenceData);

	const joinPromise = channelController.join({
		async onJoin(response: JoinPayload) {
			// on join here may not be attached to client,
			// this might be an independent channel residing in the comments component
			// client.commentsChannel.push(markRaw(c));
		},
		onLeave() {},
	});

	const c = shallowReadonly({
		channelController,
		commentResourceId,
		//joinPromise,
	});

	function _syncPresentUsers(presence: Presence) {
		if (!room.value) {
			return;
		}

		room.value.memberCollection.doBatchWork(() => {
			presence.list(_syncPresenceData);
		});
	}
	//interface CommentReactionPayload {
	//	community_id?: number;
	//}
	//data: SubscriptionCommunityData = {}

	function listenToCommentsReactions(
		resource: string,
		resourceId: string,
		parentCommentId: string
	) {
		return channelController.push('follow_comment', {
			resource: data.community_id,
		});
	}

	function _syncPresenceData(presenceId: string, commentsPresence: CommentsPresence | undefined) {
		if (!commentsPresence) {
			return;
		}

		const userId = +presenceId;

		let isTyping = false;
		let username = null;
		for (const meta of commentsPresence.metas) {
			if (meta.typing) {
				isTyping = true;
			}
			if (meta.username) {
				username = meta.username;
			}
		}

		if (isTyping && username) {
			room.value.usersTyping.set(userId, {
				username,
			});
		} else {
			room.value.usersTyping.delete(userId);
		}
	}
}
