<script lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppFadeCollapse from '../../../../../_common/AppFadeCollapse.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumChannelModel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPostModel } from '../../../../../_common/forum/post/post.model';
import { ForumTopicModel } from '../../../../../_common/forum/topic/topic.model';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppMessageThreadPagination from '../../../../../_common/message-thread/pagination/AppMessageThreadPagination.vue';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import { showReportModal } from '../../../../../_common/report/modal/modal.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/AppScrollAffix.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '../../../../../_common/user/AppUserVerifiedTick.vue';
import { enforceLocation } from '../../../../../utils/router';
import FormForumTopic from '../../../../components/forms/forum/topic/FormForumTopic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumPostList from '../../../../components/forum/post-list/post-list.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';
import AppPageHeaderAvatar from '../../../../components/page-header/AppPageHeaderAvatar.vue';
import AppPageHeaderControls from '../../../../components/page-header/controls/controls.vue';

function validateString(str: string | string[]): string {
	return Array.isArray(str) ? str[0] : str;
}

export default {
	...defineAppRouteOptions({
		cache: true,
		reloadOn: { params: ['slug', 'id'], query: ['page'] },
		async resolver({ route }) {
			HistoryTick.sendBeacon('forum-topic', parseInt(validateString(route.params.id), 10));

			const payload = await Api.sendRequest(
				'/web/forums/topics/' + route.params.id + '?page=' + (route.query.page || 1)
			);

			if (payload && payload.topic) {
				const redirect = enforceLocation(route, { slug: payload.topic.slug });
				if (redirect) {
					return redirect;
				}
			}

			return payload;
		},
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();

const { user } = useCommonStore();

const topic = ref<ForumTopicModel>(null as any);
const channel = ref<ForumChannelModel>(null as any);
const posts = ref<ForumPostModel[]>([]);
const userPostCounts = ref<any>(null);
const isEditingTopic = ref(false);
const canToggleDescription = ref(false);
const showFullDescription = ref(false);
const currentPage = ref(1);
const perPage = ref(0);

const sort = computed(() => route.query.sort);

function editTopic() {
	isEditingTopic.value = true;
	Popper.hideAll();
}

function closeEditTopic() {
	isEditingTopic.value = false;
}

function pageChange() {
	// We try to switch pages and give it time for the main post to cut off
	// if it's too long. This is super hacky, it doesn't always work... I
	// don't really know how to make this better. Maybe a scroll directive
	// that gets loaded in once the content is loaded for main post? Would
	// sure be a lot of work just to get the scrolling hook working better.
	setTimeout(() => {
		Scroll.to('forum-posts-list', { animate: true });
	}, 200);
}

function report() {
	showReportModal(topic.value);
}

createAppRoute({
	routeTitle: computed(() => {
		if (topic.value) {
			return topic.value.title;
		}
		return null;
	}),
	onResolved({ payload }) {
		topic.value = new ForumTopicModel(payload.topic);
		channel.value = new ForumChannelModel(payload.channel);
		posts.value = ForumPostModel.populate(payload.posts);

		perPage.value = payload.perPage;
		currentPage.value = payload.page || 1;
		userPostCounts.value = payload.userPostCounts || {};
	},
});
</script>

<template>
	<div v-if="topic">
		<AppPageHeader>
			<div>
				<span
					v-if="topic.is_locked"
					v-app-tooltip="
						$gettext(`This topic is locked and can no longer be replied to.`)
					"
					class="tag"
				>
					<AppJolticon icon="lock" />
					{{ $gettext(`Locked`) }}
				</span>
			</div>

			<h1 :class="{ h2: Screen.isMobile }">
				{{ topic.title }}
			</h1>

			<div>
				{{ $gettext(`by`) }}
				{{ ' ' }}
				<RouterLink
					:to="{ name: 'profile.overview', params: { username: topic.user.username } }"
				>
					{{ topic.user.display_name }}
					<AppUserVerifiedTick :user="topic.user" />
					{{ ' ' }}
					<small>@{{ topic.user.username }}</small>
				</RouterLink>

				<span v-if="!Screen.isXs" class="small">
					<span class="dot-separator" />
					<AppTimeAgo :date="topic.posted_on" />
				</span>
			</div>

			<template #spotlight>
				<AppPageHeaderAvatar :user="topic.user" />
			</template>

			<template #nav>
				<AppForumBreadcrumbs :channel="channel" :sort="sort" page="view-topic" />
			</template>

			<template v-if="user" #controls>
				<AppPageHeaderControls>
					<template v-if="user" #end>
						<AppPopper popover-class="fill-darkest">
							<AppButton circle trans icon="ellipsis-v" />

							<template #popover>
								<div class="list-group list-group-dark thin">
									<a class="list-group-item has-icon" @click="report">
										<AppJolticon icon="flag" notice />
										{{ $gettext(`Report Topic`) }}
									</a>
									<a
										v-if="user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/forums/topics/remove/${topic.id}`
										"
										target="_blank"
									>
										{{ $gettext(`Remove Topic`) }}
									</a>
									<a
										v-if="user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/users/view/${topic.user_id}`
										"
										target="_blank"
									>
										{{ $gettext(`Moderate User`) }}
									</a>
								</div>
							</template>
						</AppPopper>
					</template>
				</AppPageHeaderControls>
			</template>
		</AppPageHeader>

		<section class="section">
			<div class="container">
				<AppForumRules />

				<div class="row">
					<div class="col-sm-3 col-sm-push-9 col-md-offset-1 col-md-push-8">
						<AppScrollAffix v-if="user" :disabled="!Screen.isDesktop">
							<AppButton
								v-if="topic.user_id === user.id && !topic.is_locked"
								block
								:disabled="isEditingTopic"
								@click="editTopic"
							>
								{{ $gettext(`Edit`) }}
							</AppButton>
						</AppScrollAffix>

						<br />
					</div>

					<div class="col-sm-9 col-sm-pull-3 col-md-8 col-md-pull-4">
						<!--
							Hide the main post while it's being edited.
						-->
						<template v-if="!isEditingTopic">
							<div>
								<div>
									<!--
										We do a fade collapse for the main post after the first page.
									-->
									<div v-if="currentPage > 1">
										<AppFadeCollapse
											:collapse-height="200"
											:is-open="showFullDescription"
											@require-change="canToggleDescription = $event"
											@expand="showFullDescription = true"
										>
											<AppContentViewer
												:source="topic.main_post.text_content"
											/>
										</AppFadeCollapse>

										<a
											v-if="canToggleDescription"
											class="hidden-text-expander"
											@click="showFullDescription = !showFullDescription"
										/>
									</div>

									<!--
										No fade collapse on first page.
									-->
									<AppContentViewer
										v-if="currentPage <= 1"
										:source="topic.main_post.text_content"
									/>
								</div>
							</div>
						</template>
						<template v-else>
							<h3 class="section-header">
								{{ $gettext(`Edit Topic`) }}
							</h3>
							<FormForumTopic
								:model="topic"
								:channel="channel"
								@cancel="closeEditTopic"
								@submit="closeEditTopic"
							/>
						</template>

						<hr />

						<p
							v-if="topic && topic.replies_count && topic.replies_count > perPage"
							class="text-muted small"
						>
							Page {{ formatNumber(currentPage) }} of
							{{ formatNumber(topic.replies_count) }} replies.
						</p>

						<AppMessageThreadPagination
							:items-per-page="perPage"
							:total-items="topic.replies_count || 0"
							:current-page="currentPage"
						/>

						<AppForumPostList
							id="forum-posts-list"
							:topic="topic"
							:posts="posts"
							:sort="sort"
							:user-post-counts="userPostCounts"
						/>

						<AppMessageThreadPagination
							:items-per-page="perPage"
							:total-items="topic.replies_count || 0"
							:current-page="currentPage"
							@pagechange="pageChange"
						/>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
