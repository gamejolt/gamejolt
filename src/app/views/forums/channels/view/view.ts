import VueRouter from 'vue-router';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./view.html';

import { ForumChannel } from '../../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumTopic } from '../../../../../lib/gj-lib-client/components/forum/topic/topic.model';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppForumTopicList } from '../../../../components/forum/topic-list/topic-list';
import { AppPagination } from '../../../../../lib/gj-lib-client/components/pagination/pagination';
import { Scroll } from '../../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppForumBreadcrumbs } from '../../../../components/forum/breadcrumbs/breadcrumbs';
import { makeObservableService } from '../../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { Store } from '../../../../store/index';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppPageHeader,
		AppJolticon,
		AppForumTopicList,
		AppPagination,
		AppForumBreadcrumbs,
	},
	filters: {
		number,
	},
})
export default class RouteForumsChannelsView extends BaseRouteComponent {
	@State app: Store['app'];

	channel: ForumChannel = null as any;
	topics: ForumTopic[] = [];
	postCountPerPage = 0;
	stickyTopics: ForumTopic[] = [];
	perPage = 0;
	currentPage = 1;

	number = number;
	Scroll = Scroll;
	Screen = makeObservableService(Screen);

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest(
			'/web/forums/channels/' + route.params.name + '?page=' + (route.query.page || 1)
		);
	}

	routed() {
		this.channel = new ForumChannel(this.$payload.channel);
		this.topics = ForumTopic.populate(this.$payload.topics);
		this.postCountPerPage = this.$payload.postCountPerPage;

		if (this.$payload.stickyTopics && this.$payload.stickyTopics.length) {
			this.stickyTopics = ForumTopic.populate(this.$payload.stickyTopics);
		} else {
			this.stickyTopics = [];
		}

		Meta.title = this.$gettextInterpolate(`%{ channel } Forum`, {
			channel: '#' + this.channel.name,
		});

		this.perPage = this.$payload.perPage;
		this.currentPage = this.$payload.page || 1;
	}
}
