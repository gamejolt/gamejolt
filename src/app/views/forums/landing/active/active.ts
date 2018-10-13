import View from '!view!./active.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppForumTopicList } from '../../../../components/forum/topic-list/topic-list';

@View
@Component({
	name: 'RouteForumsLandingActive',
	components: {
		AppForumTopicList,
	},
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/forums/active-topics'),
})
export default class RouteForumsLandingActive extends BaseRouteComponent {
	topics: ForumTopic[] = [];
	postCountPerPage = 0;

	get routeTitle() {
		return this.$gettext(`Active Topics in All Forums`);
	}

	routeResolved($payload: any) {
		this.topics = ForumTopic.populate($payload.topics);
		this.postCountPerPage = $payload.postCountPerPage;
	}
}
