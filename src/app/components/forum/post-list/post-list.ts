import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./post-list.html';

import { ForumPost } from '../../../../lib/gj-lib-client/components/forum/post/post.model';
import { ForumTopic } from '../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { AppForumPostListItem } from './item/item';
import { AppMessageThread } from '../../../../lib/gj-lib-client/components/message-thread/message-thread';

@View
@Component({
	components: {
		AppMessageThread,
		AppForumPostListItem,
	},
})
export class AppForumPostList extends Vue {
	@Prop(ForumTopic) topic: ForumTopic;
	@Prop(Array) posts: ForumPost[];

	// No longer showing this.
	@Prop(Object) userPostCounts: any;

	// Bubble it up.
	onReplied(...args: any[]) {
		this.$emit('replied', ...args);
	}
}
