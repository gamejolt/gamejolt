import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./topic-list.html?style=./topic-list.styl';

import { ForumTopic } from '../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
		AppTimeAgo,
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppForumTopicList extends Vue {
	@Prop([Array])
	topics: ForumTopic[];
	@Prop([Number])
	postCountPerPage: number;

	date = date;
	number = number;
	Screen = makeObservableService(Screen);

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
}
