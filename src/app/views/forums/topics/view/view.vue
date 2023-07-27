<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../../_common/AppFadeCollapse.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import AppMessageThreadPagination from '../../../../../_common/message-thread/pagination/pagination.vue';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import { ReportModal } from '../../../../../_common/report/modal/modal.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/AppScrollAffix.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { vAppScrollTo } from '../../../../../_common/scroll/to/to.directive';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '../../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { enforceLocation } from '../../../../../utils/router';
import FormForumPost from '../../../../components/forms/forum/post/post.vue';
import FormForumTopic from '../../../../components/forms/forum/topic/topic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumPostList from '../../../../components/forum/post-list/post-list.vue';
import AppForumRules from '../../../../components/forum/rules/rules.vue';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';
import AppPageHeaderAvatar from '../../../../components/page-header/AppPageHeaderAvatar.vue';
import AppPageHeaderControls from '../../../../components/page-header/controls/controls.vue';

@Options({
	name: 'RouteForumsTopicsView',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
		AppUserAvatar,
		AppUserCardHover,
		AppForumBreadcrumbs,
		AppTimeAgo,
		AppPopper,
		AppFadeCollapse,
		AppForumPostList,
		AppScrollAffix,
		AppMessageThreadPagination,
		FormForumPost,
		FormForumTopic,
		AppContentViewer,
		AppUserVerifiedTick,
		AppForumRules,
		AppPageHeaderAvatar,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppScrollTo: vAppScrollTo,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	deps: { params: ['slug', 'id'], query: ['page'] },
	async resolver({ route }) {
		HistoryTick.sendBeacon('forum-topic', parseInt(route.params.id, 10));

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
})
export default class RouteForumsTopicsView extends LegacyRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	topic: ForumTopic = null as any;
	channel: ForumChannel = null as any;
	posts: ForumPost[] = [];

	isEditingTopic = false;
	canToggleDescription = false;
	showFullDescription = false;

	followerCount = 0;
	currentPage = 1;
	perPage = 0;
	userPostCounts: any = null;
	unfollowHover = false;

	readonly Screen = Screen;
	readonly Environment = Environment;
	readonly formatNumber = formatNumber;

	get loginUrl() {
		return (
			Environment.authBaseUrl + '/login?redirect=' + encodeURIComponent(this.$route.fullPath)
		);
	}

	get sort() {
		return this.$route.query.sort;
	}

	get routeTitle() {
		if (this.topic) {
			return this.topic.title;
		}
		return null;
	}

	routeResolved($payload: any) {
		this.topic = new ForumTopic($payload.topic);
		this.channel = new ForumChannel($payload.channel);
		this.posts = ForumPost.populate($payload.posts);

		this.perPage = $payload.perPage;
		this.currentPage = $payload.page || 1;
		this.followerCount = $payload.followerCount || 0;
		this.userPostCounts = $payload.userPostCounts || {};
	}

	editTopic() {
		this.isEditingTopic = true;
		Popper.hideAll();
	}

	closeEditTopic() {
		this.isEditingTopic = false;
	}

	pageChange() {
		// We try to switch pages and give it time for the main post to cut off
		// if it's too long. This is super hacky, it doesn't always work... I
		// don't really know how to make this better. Maybe a scroll directive
		// that gets loaded in once the content is loaded for main post? Would
		// sure be a lot of work just to get the scrolling hook working better.
		setTimeout(() => {
			Scroll.to('forum-posts-list', { animate: true });
		}, 200);
	}

	report() {
		ReportModal.show(this.topic);
	}
}
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
					<AppTranslate>Locked</AppTranslate>
				</span>
			</div>

			<h1 :class="{ h2: Screen.isMobile }">
				{{ topic.title }}
			</h1>

			<div>
				<AppTranslate>by</AppTranslate>
				{{ ' ' }}
				<router-link
					:to="{ name: 'profile.overview', params: { username: topic.user.username } }"
				>
					{{ topic.user.display_name }}
					<AppUserVerifiedTick :user="topic.user" />
					{{ ' ' }}
					<small>@{{ topic.user.username }}</small>
				</router-link>

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

			<template v-if="app.user" #controls>
				<AppPageHeaderControls>
					<template v-if="app.user" #end>
						<AppPopper popover-class="fill-darkest">
							<AppButton circle trans icon="ellipsis-v" />

							<template #popover>
								<div class="list-group list-group-dark thin">
									<a class="list-group-item has-icon" @click="report">
										<AppJolticon icon="flag" notice />
										<AppTranslate>Report Topic</AppTranslate>
									</a>
									<a
										v-if="app.user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/forums/topics/remove/${topic.id}`
										"
										target="_blank"
									>
										<AppTranslate>Remove Topic</AppTranslate>
									</a>
									<a
										v-if="app.user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/users/view/${topic.user_id}`
										"
										target="_blank"
									>
										<AppTranslate>Moderate User</AppTranslate>
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
						<AppScrollAffix v-if="app.user" :disabled="!Screen.isDesktop">
							<AppButton
								v-if="topic.user_id === app.user.id && !topic.is_locked"
								block
								:disabled="isEditingTopic"
								@click="editTopic"
							>
								<AppTranslate>Edit</AppTranslate>
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
											v-app-track-event="`forum-topic:show-full-post`"
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
								<AppTranslate>Edit Topic</AppTranslate>
							</h3>
							<FormForumTopic
								:model="topic"
								:channel="channel"
								@cancel="closeEditTopic"
								@submit="closeEditTopic"
							/>
						</template>

						<hr />

						<p v-if="topic.replies_count > perPage" class="text-muted small">
							Page {{ formatNumber(currentPage) }} of
							{{ formatNumber(topic.replies_count) }} replies.
						</p>

						<AppMessageThreadPagination
							:items-per-page="perPage"
							:total-items="topic.replies_count"
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
							:total-items="topic.replies_count"
							:current-page="currentPage"
							@pagechange="pageChange"
						/>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
