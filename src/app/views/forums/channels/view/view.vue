<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumChannelModel } from '../../../../../_common/forum/channel/channel.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import AppNavTabList from '../../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../../_common/pagination/pagination.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';
import AppForumTopicList from '../../../../components/forum/topic-list/topic-list.vue';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';

@Options({
	name: 'RouteForumsChannelsView',
	components: {
		AppPageHeader,
		AppForumTopicList,
		AppPagination,
		AppForumBreadcrumbs,
		AppNavTabList,
		AppForumRules,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	deps: { params: ['name', 'sort'], query: ['page'] },
	resolver({ route }) {
		const sort = 'archived';
		return Api.sendRequest(
			`/web/forums/channels/${route.params.name}/${sort}?page=${route.query.page || 1}`
		);
	},
})
export default class RouteForumsChannelsView extends LegacyRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	channel: ForumChannelModel = null as any;
	topics: ForumTopicModel[] = [];
	postCountPerPage = 0;
	stickyTopics: ForumTopicModel[] = [];
	perPage = 0;
	currentPage = 1;
	listableTopicsCount = 0;

	readonly formatNumber = formatNumber;
	readonly Scroll = Scroll;
	readonly Screen = Screen;

	get sort() {
		return 'archived';
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
		this.channel = new ForumChannelModel($payload.channel);
		this.topics = ForumTopicModel.populate($payload.topics);
		this.postCountPerPage = $payload.postCountPerPage;
		this.listableTopicsCount = $payload.listableTopicsCount;

		if ($payload.stickyTopics && $payload.stickyTopics.length) {
			this.stickyTopics = ForumTopicModel.populate($payload.stickyTopics);
		} else {
			this.stickyTopics = [];
		}

		this.perPage = $payload.perPage;
		this.currentPage = $payload.page || 1;
	}
}
</script>

<template>
	<div v-if="channel">
		<AppPageHeader>
			<h1>#{{ channel.name }}</h1>

			<!-- Don't let it get too long! -->
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-7">
					<p>{{ channel.description }}</p>
				</div>
			</div>

			<div class="clearfix">
				<br class="hidden-sm-up" />

				<ul class="stat-list" :class="Screen.isXs ? 'text-center' : 'pull-left'">
					<li class="stat-big stat-big-smaller">
						<div class="stat-big-label">Topics</div>
						<div class="stat-big-digit">
							{{ formatNumber(channel.topics_count || 0) }}
						</div>
					</li>
					<li class="stat-big stat-big-smaller">
						<div class="stat-big-label">Replies</div>
						<div class="stat-big-digit">
							{{ formatNumber(channel.replies_count || 0) }}
						</div>
					</li>
				</ul>
			</div>

			<template #nav>
				<AppForumBreadcrumbs :channel="channel" :sort="sort" />
			</template>
		</AppPageHeader>

		<div class="section">
			<div id="forum-topics-list" class="container">
				<AppForumRules />
				<hr />

				<template v-if="stickyTopics.length">
					<AppForumTopicList
						:topics="stickyTopics"
						:post-count-per-page="postCountPerPage"
					/>

					<br />
				</template>

				<AppNavTabList>
					<template v-if="topics.length" #meta>
						<span class="text-muted small">
							<AppTranslate
								:translate-params="{
									currentPage: formatNumber(currentPage),
									count: formatNumber(listableTopicsCount),
								}"
								:translate-n="listableTopicsCount"
								translate-plural="Page %{ currentPage } of %{ count } topics."
							>
								%{ count } topic.
							</AppTranslate>
						</span>
					</template>
				</AppNavTabList>

				<br />

				<template v-if="topics.length">
					<AppForumTopicList
						:topics="topics"
						:sort="sort"
						:use-upvotes="channel.type === 'voting'"
						:post-count-per-page="postCountPerPage"
					/>

					<AppPagination
						:pager="true"
						:items-per-page="perPage"
						:total-items="listableTopicsCount"
						:current-page="currentPage"
						@pagechange="Scroll.to('forum-topics-list', { animate: false })"
					/>
				</template>
				<div v-else class="text-center">
					<p class="lead">
						<AppTranslate>There aren't any topics here.</AppTranslate>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
