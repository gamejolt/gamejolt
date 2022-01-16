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
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../_common/scroll/affix/affix.vue';
import { Scroll } from '../../../../../_common/scroll/scroll.service';
import { AppScrollTo } from '../../../../../_common/scroll/to/to.directive';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
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
		AppTooltip,
		AppScrollTo,
	},
})
@RouteResolver({
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
		<app-page-header>
			<div>
				<span
					v-if="topic.is_locked"
					v-app-tooltip="
						$gettext(`This topic is locked and can no longer be replied to.`)
					"
					class="tag"
				>
					<app-jolticon icon="lock" />
					<translate>Locked</translate>
				</span>
			</div>

			<h1 :class="{ h2: Screen.isMobile }">
				{{ topic.title }}
			</h1>

			<div>
				<translate>by</translate>
				{{ ' ' }}
				<router-link
					:to="{ name: 'profile.overview', params: { username: topic.user.username } }"
				>
					{{ topic.user.display_name }}
					<app-user-verified-tick :user="topic.user" />
					{{ ' ' }}
					<small>@{{ topic.user.username }}</small>
				</router-link>

				<span v-if="!Screen.isXs" class="small">
					<span class="dot-separator" />
					<app-time-ago :date="topic.posted_on" />
				</span>
			</div>

			<template #spotlight>
				<app-user-card-hover :user="topic.user">
					<app-user-avatar :user="topic.user" />
				</app-user-card-hover>
			</template>

			<template #nav>
				<app-forum-breadcrumbs :channel="channel" :sort="sort" page="view-topic" />
			</template>

			<template v-if="app.user" #controls>
				<app-page-header-controls>
					<app-button
						v-if="!isFollowing"
						v-app-tooltip="$gettext(`Keep track of replies in this topic.`)"
						primary
						block
						@click="follow"
					>
						<translate>Follow</translate>
					</app-button>
					<app-button
						v-else
						v-app-tooltip="$gettext(`Stop Following`)"
						primary
						solid
						block
						@click="unfollow"
						@mouseenter="unfollowHover = true"
						@mouseleave="unfollowHover = false"
					>
						<translate>Following</translate>
					</app-button>

					<template v-if="app.user" #end>
						<app-popper popover-class="fill-darkest">
							<app-button circle trans icon="ellipsis-v" />

							<template #popover>
								<div class="list-group list-group-dark thin">
									<a class="list-group-item has-icon" @click="report">
										<app-jolticon icon="flag" notice />
										<translate>Report Topic</translate>
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
										<translate>Toggle Sticky</translate>
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
										<translate>Toggle Lock</translate>
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
										<translate>Edit Topic</translate>
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
										<translate>Move Topic</translate>
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
										<translate>Remove Topic</translate>
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
										<translate>Moderate User</translate>
									</a>
								</div>
							</template>
						</app-popper>
					</template>
				</app-page-header-controls>
			</template>
		</app-page-header>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-sm-3 col-sm-push-9 col-md-offset-1 col-md-push-8">
						<app-scroll-affix v-if="app.user" :disabled="!Screen.isDesktop">
							<app-button
								v-if="!topic.is_locked"
								v-app-scroll-to="`add-reply`"
								primary
								block
							>
								<translate>Add Reply</translate>
							</app-button>

							<app-button
								v-if="topic.user_id === app.user.id && !topic.is_locked"
								block
								:disabled="isEditingTopic"
								@click="editTopic"
							>
								<translate>Edit</translate>
							</app-button>
						</app-scroll-affix>

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
										<app-fade-collapse
											:collapse-height="200"
											:is-open="showFullDescription"
											@require-change="canToggleDescription = $event"
											@expand="showFullDescription = true"
										>
											<app-content-viewer
												:source="topic.main_post.text_content"
											/>
										</app-fade-collapse>

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
									<app-content-viewer
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
									<app-forum-topic-upvote-widget :topic="topic" />
								</div>
							</div>
						</template>
						<template v-else>
							<h3 class="section-header">
								<translate>Edit Topic</translate>
							</h3>
							<form-forum-topic
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

						<app-message-thread-pagination
							:items-per-page="perPage"
							:total-items="topic.replies_count"
							:current-page="currentPage"
						/>

						<app-forum-post-list
							id="forum-posts-list"
							:topic="topic"
							:posts="posts"
							:sort="sort"
							:user-post-counts="userPostCounts"
							@replied="onPostAdded"
						/>

						<app-message-thread-pagination
							:items-per-page="perPage"
							:total-items="topic.replies_count"
							:current-page="currentPage"
							@pagechange="pageChange"
						/>

						<hr />

						<template v-if="app.user">
							<app-message-thread-add v-if="!topic.is_locked">
								<h4 id="add-reply" class="sans-margin-top">
									<translate>Add Reply</translate>
								</h4>

								<form-forum-post :topic="topic" @submit="onPostAdded" />
							</app-message-thread-add>

							<div v-if="topic.is_locked" class="alert full-bleed-xs">
								<p>
									<app-jolticon icon="lock" />
									<translate>
										This topic is locked and can no longer be replied to.
									</translate>
								</p>
							</div>
						</template>
						<div v-else class="alert full-bleed-xs">
							<p>
								<app-jolticon icon="exclamation-circle" />
								<a :href="loginUrl">
									<translate>
										You must be logged in to Game Jolt to post replies.
									</translate>
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
