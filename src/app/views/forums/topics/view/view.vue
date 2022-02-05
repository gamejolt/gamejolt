<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { enforceLocation } from '../../../../../utils/router';
import { Api } from '../../../../../_common/api/api.service';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import { ForumChannel } from '../../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../../_common/forum/post/post.model';
import { ForumTopic } from '../../../../../_common/forum/topic/topic.model';
import { showInfoGrowl } from '../../../../../_common/growls/growls.service';
import { HistoryTick } from '../../../../../_common/history-tick/history-tick-service';
import AppMessageThreadAdd from '../../../../../_common/message-thread/add/add.vue';
import AppMessageThreadPagination from '../../../../../_common/message-thread/pagination/pagination.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { ReportModal } from '../../../../../_common/report/modal/modal.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/AppScrollAffix.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { vAppScrollTo } from '../../../../../_common/scroll/to/to.directive';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppUserCardHover from '../../../../../_common/user/card/hover/hover.vue';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../../_common/user/verified-tick/verified-tick.vue';
import FormForumPost from '../../../../components/forms/forum/post/post.vue';
import FormForumTopic from '../../../../components/forms/forum/topic/topic.vue';
import AppForumBreadcrumbs from '../../../../components/forum/breadcrumbs/breadcrumbs.vue';
import AppForumPostList from '../../../../components/forum/post-list/post-list.vue';
import AppForumTopicUpvoteWidget from '../../../../components/forum/topic/upvote-widget/upvote-widget.vue';
import AppPageHeaderControls from '../../../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';

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
		AppMessageThreadAdd,
		AppMessageThreadPagination,
		FormForumPost,
		FormForumTopic,
		AppForumTopicUpvoteWidget,
		AppContentViewer,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip: vAppTooltip,
		AppScrollTo: vAppScrollTo,
	},
})
@OptionsForRoute({
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
export default class RouteForumsTopicsView extends BaseRouteComponent {
	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	topic: ForumTopic = null as any;
	channel: ForumChannel = null as any;
	posts: ForumPost[] = [];

	isEditingTopic = false;
	isFollowing = false;
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

	get shouldShowVoting() {
		return this.topic.can_upvote && !this.topic.is_locked;
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
		this.isFollowing = $payload.isFollowing || false;
		this.followerCount = $payload.followerCount || 0;
		this.userPostCounts = $payload.userPostCounts || {};
	}

	async onPostAdded(newPost: ForumPost, response: any) {
		// If their post was marked as spam, make sure they know.
		if (newPost.status === ForumPost.STATUS_SPAM) {
			showInfoGrowl(
				this.$gettext(
					`Your post has been marked for review. Please allow some time for it to show on the site.`
				),
				this.$gettext(`Post Needs Review`)
			);
		}

		// When the new post comes into the DOM the hash will match and it will
		// scroll to it.
		this.$router.replace({
			name: this.$route.name,
			query: { page: response.page },
			hash: '#forum-post-' + newPost.id,
		});
	}

	editTopic() {
		this.isEditingTopic = true;
		Popper.hideAll();
	}

	closeEditTopic() {
		this.isEditingTopic = false;
	}

	async follow() {
		await this.topic.$follow();
		this.isFollowing = true;
		++this.followerCount;
	}

	async unfollow() {
		await this.topic.$unfollow();
		this.isFollowing = false;
		--this.followerCount;
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
				<AppUserCardHover :user="topic.user">
					<AppUserAvatar :user="topic.user" />
				</AppUserCardHover>
			</template>

			<template #nav>
				<AppForumBreadcrumbs :channel="channel" :sort="sort" page="view-topic" />
			</template>

			<template v-if="app.user" #controls>
				<AppPageHeaderControls>
					<AppButton
						v-if="!isFollowing"
						v-app-tooltip="$gettext(`Keep track of replies in this topic.`)"
						primary
						block
						@click="follow"
					>
						<AppTranslate>Follow</AppTranslate>
					</AppButton>
					<AppButton
						v-else
						v-app-tooltip="$gettext(`Stop Following`)"
						primary
						solid
						block
						@click="unfollow"
						@mouseenter="unfollowHover = true"
						@mouseleave="unfollowHover = false"
					>
						<AppTranslate>Following</AppTranslate>
					</AppButton>

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
											`/moderate/forums/topics/toggle-sticky/${topic.id}`
										"
										target="_blank"
									>
										<AppTranslate>Toggle Sticky</AppTranslate>
									</a>
									<a
										v-if="app.user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/forums/topics/toggle-lock/${topic.id}`
										"
										target="_blank"
									>
										<AppTranslate>Toggle Lock</AppTranslate>
									</a>
									<a
										v-if="app.user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/forums/topics/edit/${topic.id}`
										"
										target="_blank"
									>
										<AppTranslate>Edit Topic</AppTranslate>
									</a>
									<a
										v-if="app.user.permission_level > 0"
										class="list-group-item"
										:href="
											Environment.baseUrl +
											`/moderate/forums/topics/move/${topic.id}`
										"
										target="_blank"
									>
										<AppTranslate>Move Topic</AppTranslate>
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
				<div class="row">
					<div class="col-sm-3 col-sm-push-9 col-md-offset-1 col-md-push-8">
						<AppScrollAffix v-if="app.user" :disabled="!Screen.isDesktop">
							<AppButton
								v-if="!topic.is_locked"
								v-app-scroll-to="`add-reply`"
								primary
								block
							>
								<AppTranslate>Add Reply</AppTranslate>
							</AppButton>

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
							<div :class="shouldShowVoting ? 'row' : ''">
								<div :class="shouldShowVoting ? 'col-sm-9' : ''">
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
								<div
									v-if="shouldShowVoting"
									class="col-sm-3"
									:class="{
										'text-center': Screen.isXs,
										'text-right': !Screen.isXs,
									}"
								>
									<AppForumTopicUpvoteWidget :topic="topic" />
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
							@replied="onPostAdded"
						/>

						<AppMessageThreadPagination
							:items-per-page="perPage"
							:total-items="topic.replies_count"
							:current-page="currentPage"
							@pagechange="pageChange"
						/>

						<hr />

						<template v-if="app.user">
							<AppMessageThreadAdd v-if="!topic.is_locked">
								<h4 id="add-reply" class="sans-margin-top">
									<AppTranslate>Add Reply</AppTranslate>
								</h4>

								<FormForumPost :topic="topic" @submit="onPostAdded" />
							</AppMessageThreadAdd>

							<div v-if="topic.is_locked" class="alert full-bleed-xs">
								<p>
									<AppJolticon icon="lock" />
									<AppTranslate>
										This topic is locked and can no longer be replied to.
									</AppTranslate>
								</p>
							</div>
						</template>
						<div v-else class="alert full-bleed-xs">
							<p>
								<AppJolticon icon="exclamation-circle" />
								<a :href="loginUrl">
									<AppTranslate>
										You must be logged in to Game Jolt to post replies.
									</AppTranslate>
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
