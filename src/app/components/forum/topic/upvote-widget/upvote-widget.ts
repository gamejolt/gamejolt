import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./upvote-widget.html';

import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppAuthRequired } from '../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';

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
	@Prop(ForumTopic) topic: ForumTopic;

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
		const count = this.upvoteCount;

		if (this.isUpvoted) {
			return this.$gettext('You upvoted this topic');
		} else if (!count) {
			return this.$gettext('Be the first to upvote this topic!');
		} else {
			return this.$gettextInterpolate(
				this.$ngettext(
					'One person upvoted this topic.',
					'%{ count } people upvoted this topic.',
					count
				),
				{ count }
			);
		}
	}

	onUpvoteClick() {
		if (!this.isUpvoted) {
			this.topic.$upvote();
		} else {
			this.topic.$unupvote();
		}
	}
}
