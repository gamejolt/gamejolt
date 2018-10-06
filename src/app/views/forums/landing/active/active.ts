import View from '!view!./active.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppForumTopicList } from '../../../../components/forum/topic-list/topic-list';

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

	@RouteResolve({
		cache: true,
		deps: {},
	})
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/forums/active-topics');
	}

	get routeTitle() {
		return this.$gettext(`Active Topics in All Forums`);
	}

	routed($payload: any) {
		this.topics = ForumTopic.populate($payload.topics);
		this.postCountPerPage = $payload.postCountPerPage;
	}
}
