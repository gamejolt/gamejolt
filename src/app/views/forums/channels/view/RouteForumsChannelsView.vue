<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumChannelModel } from '../../../../../_common/forum/channel/channel.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import AppNavTabList from '../../../../../_common/nav/tab-list/AppNavTabList.vue';
import AppPagination from '../../../../../_common/pagination/AppPagination.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { $gettext, $ngettext } from '../../../../../_common/translate/translate.service';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';
import AppForumTopicList from '../../../../components/forum/topic-list/topic-list.vue';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';

const sort = 'archived';

export default {
	...defineAppRouteOptions({
		cache: true,
		deps: { params: ['name', 'sort'], query: ['page'] },
		resolver({ route }) {
			const sort = 'archived';
			return Api.sendRequest(
				`/web/forums/channels/${route.params.name}/${sort}?page=${route.query.page || 1}`
			);
		},
	}),
};
</script>

<script lang="ts" setup>
const channel = ref<ForumChannelModel>(null as any);
const topics = ref<ForumTopicModel[]>([]);
const stickyTopics = ref<ForumTopicModel[]>([]);
const postCountPerPage = ref(0);
const perPage = ref(0);
const currentPage = ref(1);
const listableTopicsCount = ref(0);

createAppRoute({
	routeTitle: computed(() => {
		if (channel.value) {
			return $gettext(`%{ channel } Forum`, {
				channel: '#' + channel.value.name,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		channel.value = new ForumChannelModel(payload.channel);
		topics.value = ForumTopicModel.populate(payload.topics);
		postCountPerPage.value = payload.postCountPerPage;
		listableTopicsCount.value = payload.listableTopicsCount;

		if (payload.stickyTopics && payload.stickyTopics.length) {
			stickyTopics.value = ForumTopicModel.populate(payload.stickyTopics);
		} else {
			stickyTopics.value = [];
		}

		perPage.value = payload.perPage;
		currentPage.value = payload.page || 1;
	},
});
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
							{{
								$ngettext(
									`%{ count } topic.`,
									`Page %{ currentPage } of %{ count } topics.`,
									listableTopicsCount,
									{
										currentPage: formatNumber(currentPage),
										count: formatNumber(listableTopicsCount),
									}
								)
							}}
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
						{{ $gettext(`There aren't any topics here.`) }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
