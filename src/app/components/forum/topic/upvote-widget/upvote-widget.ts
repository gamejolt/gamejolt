import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { number } from '../../../../../_common/filters/number';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';

@Component({
	directives: {
		AppAuthRequired,
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppForumTopicUpvoteWidget extends Vue {
	@Prop(ForumTopic) topic!: ForumTopic;

	get canUpvote() {
		return this.topic.can_upvote;
	}

	get isUpvoted() {
		return this.topic.is_upvoted;
	}

	get upvoteCount() {
		return this.topic.upvotes_count;
	}

	get upvoteTooltip() {
		if (!this.isUpvoted) {
			return this.$gettext(`Upvote this topic!`);
		} else {
			return this.$gettext(`Cool. You've upvoted this topic.`);
		}
	}

	onUpvoteClick() {
		if (!this.isUpvoted) {
			this.topic.$upvote();
		} else {
			this.topic.$removeUpvote();
		}
	}
}
