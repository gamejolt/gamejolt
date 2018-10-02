import View from '!view!./view.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { State } from 'vuex-class';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { AppNavTabList } from '../../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppPagination } from '../../../../../lib/gj-lib-client/components/pagination/pagination';
import { BaseRouteComponent, RouteResolve } from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppForumBreadcrumbs } from '../../../../components/forum/breadcrumbs/breadcrumbs';
import { AppForumTopicList } from '../../../../components/forum/topic-list/topic-list';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { Store } from '../../../../store/index';

@View
@Component({
	name: 'RouteForumsChannelsView',
	components: {
		AppPageHeader,
		AppJolticon,
		AppForumTopicList,
		AppPagination,
		AppForumBreadcrumbs,
		AppNavTabList,
	},
	filters: {
		number,
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

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: Route) {
		const sort = route.params.sort || 'active';
		return Api.sendRequest(
			`/web/forums/channels/${route.params.name}/${sort}?page=${route.query.page || 1}`
		);
	}

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

	routed($payload: any) {
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
