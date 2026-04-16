<script lang="ts" setup>
import AppForumPostListItem from '~app/components/forum/post-list/item/AppForumPostListItem.vue';
import { ForumPostModel } from '~common/forum/post/post.model';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import AppMessageThread from '~common/message-thread/AppMessageThread.vue';

type Props = {
	topic: ForumTopicModel;
	posts: ForumPostModel[];
	sort: string;
	userPostCounts: any;
};

const { topic, posts, userPostCounts } = defineProps<Props>();
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
