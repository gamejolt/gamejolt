import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppUserCardHover from 'game-jolt-frontend-lib/components/user/card/hover/hover.vue';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppForumTopicUpvoteWidget from '../topic/upvote-widget/upvote-widget.vue';


@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppUserCardHover,
		AppUserAvatar,
		AppForumTopicUpvoteWidget,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppForumTopicList extends Vue {
	@Prop(Array) topics!: ForumTopic[];
	@Prop(String) sort!: string;
	@Prop(Boolean) useUpvotes!: boolean;
	@Prop(Number) postCountPerPage!: number;

	readonly number = number;
	readonly Screen = Screen;

	getPostPage(topic: ForumTopic) {
		if (!this.postCountPerPage) {
			return undefined;
		}

		const page = Math.ceil((topic.replies_count || 0) / this.postCountPerPage);
		if (page === 1) {
			return undefined;
		}

		return page;
	}

	shouldShowVoting(topic: ForumTopic) {
		return this.useUpvotes && !topic.is_locked;
	}
}
