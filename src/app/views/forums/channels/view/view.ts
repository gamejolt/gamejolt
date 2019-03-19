import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { ForumChannel } from 'game-jolt-frontend-lib/components/forum/channel/channel.model';
import { ForumTopic } from 'game-jolt-frontend-lib/components/forum/topic/topic.model';
import AppNavTabList from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list.vue';
import AppPagination from 'game-jolt-frontend-lib/components/pagination/pagination.vue';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumTopicList from '../../../../components/forum/topic-list/topic-list.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { Store } from '../../../../store/index';

@Component({
	name: 'RouteForumsChannelsView',
	components: {
		AppPageHeader,
		AppForumTopicList,
		AppPagination,
		AppForumBreadcrumbs,
		AppNavTabList,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	deps: { params: ['name', 'sort'], query: ['page'] },
	resolver({ route }) {
		const sort = route.params.sort || 'active';
		return Api.sendRequest(
			`/web/forums/channels/${route.params.name}/${sort}?page=${route.query.page || 1}`
		);
	},
})
export default class RouteForumsChannelsView extends BaseRouteComponent {
	@State
	app!: Store['app'];

	channel: ForumChannel = null as any;
	topics: ForumTopic[] = [];
	postCountPerPage = 0;
	stickyTopics: ForumTopic[] = [];
	perPage = 0;
	currentPage = 1;
	listableTopicsCount = 0;

	readonly number = number;
	readonly Scroll = Scroll;
	readonly Screen = Screen;

	get sort() {
		return this.$route.params.sort || 'active';
	}

	get page() {
		return this.$route.query.page || 1;
	}

	get routeTitle() {
		if (this.channel) {
			return this.$gettextInterpolate(`%{ channel } Forum`, {
				channel: '#' + this.channel.name,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.channel = new ForumChannel($payload.channel);
		this.topics = ForumTopic.populate($payload.topics);
		this.postCountPerPage = $payload.postCountPerPage;
		this.listableTopicsCount = $payload.listableTopicsCount;

		if ($payload.stickyTopics && $payload.stickyTopics.length) {
			this.stickyTopics = ForumTopic.populate($payload.stickyTopics);
		} else {
			this.stickyTopics = [];
		}

		this.perPage = $payload.perPage;
		this.currentPage = $payload.page || 1;
	}
}
