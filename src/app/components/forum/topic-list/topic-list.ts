import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../_common/filters/number';
import { ForumTopic } from '../../../../_common/forum/topic/topic.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import AppForumTopicUpvoteWidget from '../topic/upvote-widget/upvote-widget.vue';

@Component({
	components: {
		AppTimeAgo,
		AppUserCardHover,
		AppUserAvatar,
		AppForumTopicUpvoteWidget,
		AppUserVerifiedTick,
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
