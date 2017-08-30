import { Component } from 'vue-property-decorator';
import * as View from '!view!./active.html';

import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppForumTopicList } from '../../../../components/forum/topic-list/topic-list';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteForumsLandingActive',
	components: {
		AppForumTopicList,
	},
})
export default class RouteForumsLandingActive extends BaseRouteComponent {
	topics: ForumTopic[] = [];
	postCountPerPage = 0;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/forums/active-topics');
	}

	get routeTitle() {
		return this.$gettext(`Active Topics in All Forums`);
	}

	routed() {
		this.topics = ForumTopic.populate(this.$payload.topics);
		this.postCountPerPage = this.$payload.postCountPerPage;
	}
}
