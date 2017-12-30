import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./topic-list.html?style=./topic-list.styl';

import { ForumTopic } from '../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppForumTopicUpvoteWidget } from '../topic/upvote-widget/upvote-widget';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
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
export class AppForumTopicList extends Vue {
	@Prop(Array) topics: ForumTopic[];
	@Prop(String) sort: string;
	@Prop(Boolean) useUpvotes: boolean;
	@Prop(Number) postCountPerPage: number;

	readonly number = number;
	readonly Screen = Screen;

	getPostPage(topic: ForumTopic) {
		if (!this.postCountPerPage) {
			return undefined;
		}

		const page = Math.ceil(topic.replies_count / this.postCountPerPage);
		if (page === 1) {
			return undefined;
		}

		return page;
	}

	shouldShowVoting(topic: ForumTopic) {
		return this.useUpvotes && !topic.is_locked;
	}
}
