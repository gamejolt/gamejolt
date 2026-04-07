<script lang="ts" setup>
import { ForumPostModel } from '../../../../_common/forum/post/post.model';
import { ForumTopicModel } from '../../../../_common/forum/topic/topic.model';
import AppMessageThread from '../../../../_common/message-thread/AppMessageThread.vue';
import AppForumPostListItem from './item/AppForumPostListItem.vue';

type Props = {
	topic: ForumTopicModel;
	posts: ForumPostModel[];
	sort: string;
	userPostCounts: any;
};

const { topic, posts, sort, userPostCounts } = defineProps<Props>();
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
