<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { ForumPost } from '../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../_common/forum/topic/topic.model';
import AppMessageThread from '../../../../_common/message-thread/message-thread.vue';
import AppForumPostListItem from './item/item.vue';

@Options({
	components: {
		AppMessageThread,
		AppForumPostListItem,
	},
})
export default class AppForumPostList extends Vue {
	@Prop(Object) topic!: ForumTopic;
	@Prop(Array) posts!: ForumPost[];
	@Prop(String) sort!: string;

	// No longer showing this.
	@Prop(Object) userPostCounts!: any;
}
</script>

<template>
	<AppMessageThread class="forum-post-list">
		<AppForumPostListItem
			v-for="post of posts"
			:key="post.id"
			:topic="topic"
			:post="post"
			:user-post-count="userPostCounts[post.user_id]"
		/>
	</AppMessageThread>
</template>
