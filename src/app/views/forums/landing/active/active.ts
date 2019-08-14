import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import AppForumTopicList from '../../../forum/topic-list/topic-list.vue';

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
