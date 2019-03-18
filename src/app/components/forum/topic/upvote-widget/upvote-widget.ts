import View from '!view!./upvote-widget.html';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { AppAuthRequired } from '../../../../../lib/gj-lib-client/components/auth/auth-required-directive';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppAuthRequired,
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export class AppForumTopicUpvoteWidget extends Vue {
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
