import { ForumCategory } from '../../../../_common/forum/category/category.model';
import { ForumChannel } from '../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../_common/forum/post/post.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import { arrayIndexByFunc } from '../../../../utils/array';
import { number } from '../../../../_common/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
		AppUserVerifiedTick,
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
