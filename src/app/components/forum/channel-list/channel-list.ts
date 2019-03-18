import { ForumCategory } from 'game-jolt-frontend-lib/components/forum/category/category.model';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumPost } from 'game-jolt-frontend-lib/components/forum/post/post.model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { arrayIndexByFunc } from 'game-jolt-frontend-lib/utils/array';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
	},
	filters: {
		number,
	},
})
export default class AppForumChannelList extends Vue {
	@Prop(ForumCategory) category!: ForumCategory;
	@Prop(Array) channels!: ForumChannel[];
	@Prop({ type: Array, default: [] })
	latestPosts!: ForumPost[];
	@Prop(Number) postCountPerPage!: number;

	readonly number = number;
	readonly Screen = Screen;

	get indexedPosts() {
		return arrayIndexByFunc(this.latestPosts, item => item.topic!.channel_id);
	}

	getPostPage(post: ForumPost) {
		if (!this.postCountPerPage) {
			return undefined;
		}

		const page = Math.ceil((post.topic.replies_count || 0) / this.postCountPerPage);
		if (page === 1) {
			return undefined;
		}

		return page;
	}
}
