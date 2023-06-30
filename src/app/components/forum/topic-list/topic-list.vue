<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../_common/filters/number';
import { ForumTopic } from '../../../../_common/forum/topic/topic.model';
import { Screen } from '../../../../_common/screen/screen-service';
import AppTimeAgo from '../../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '../../../../_common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';

@Options({
	components: {
		AppTimeAgo,
		AppUserCardHover,
		AppUserAvatar,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppForumTopicList extends Vue {
	@Prop(Array) topics!: ForumTopic[];
	@Prop(String) sort!: string;
	@Prop(Boolean) useUpvotes!: boolean;
	@Prop(Number) postCountPerPage!: number;

	readonly formatNumber = formatNumber;
	readonly Screen = Screen;

	getPostPage(topic: ForumTopic) {
		if (!this.postCountPerPage) {
			return undefined;
		}

		const page = Math.ceil((topic.replies_count || 0) / this.postCountPerPage);
		if (page === 1) {
			return undefined;
		}

		return page;
	}
}
</script>

<template>
	<div class="forum-topic-list">
		<div v-for="topic of topics" :key="topic.id" class="forum-topic-list-item">
			<div class="-main">
				<div class="row">
					<div class="col-sm-9 col-md-7">
						<h5 class="forum-topic-list-item-title">
							<!-- Notifications -->
							<span v-if="!!topic.notifications.length" class="tag tag-highlight">
								{{ formatNumber(topic.notifications.length) }}
							</span>

							<!-- Pinned -->
							<span
								v-if="topic.is_sticky"
								v-app-tooltip="$gettext(`This topic is pinned.`)"
							>
								<AppJolticon icon="thumbtack" highlight />
							</span>

							<!-- Locked -->
							<span
								v-if="topic.is_locked"
								v-app-tooltip="
									$gettext(
										`This topic is locked and can no longer be replied to.`
									)
								"
							>
								<AppJolticon icon="lock" class="text-muted" />
							</span>

							<router-link
								class="link-unstyled"
								:to="{
									name: 'forums.topics.view',
									params: { slug: topic.slug, id: topic.id },
									query: { sort: sort },
								}"
							>
								{{ topic.title }}
							</router-link>
						</h5>
						<div class="forum-topic-list-item-author">
							<AppTranslate>by</AppTranslate>
							{{ ' ' }}
							<router-link
								class="link-muted"
								:to="{
									name: 'profile.overview',
									params: { username: topic.user.username },
								}"
							>
								{{ topic.user.display_name }}
								<AppUserVerifiedTick :user="topic.user" />
							</router-link>
							{{ ' ' }}
							<span class="tiny">@{{ topic.user.username }}</span>
						</div>
					</div>
					<div
						class="col-sm-3 col-md-2 text-muted small"
						:class="{ 'text-right': !Screen.isXs }"
					>
						<span
							v-translate="{ count: formatNumber(topic.replies_count || 0) }"
							:translate-n="topic.replies_count || 0"
							translate-plural="<b>%{ count }</b> Replies"
						>
							<b>%{ count }</b>
							Reply
						</span>
						<br class="hidden-xs" />
						<span class="hidden-sm hidden-md hidden-lg dot-separator" />
						<span
							v-translate="{ count: formatNumber(topic.followers_count || 0) }"
							:translate-n="topic.followers_count || 0"
							translate-plural="<b>%{ count }</b> Followers"
						>
							<b>%{ count }</b>
							Follower
						</span>
					</div>
					<div v-if="Screen.isDesktop" class="col-md-3 text-muted small">
						<div class="forum-topic-list-item-latest-post clearfix">
							<div class="forum-topic-list-item-latest-post-avatar">
								<AppUserCardHover :user="topic.latest_post.user">
									<AppUserAvatar :user="topic.latest_post.user" />
								</AppUserCardHover>
							</div>
							<div class="forum-topic-list-item-latest-post-info">
								<div class="forum-topic-list-item-latest-post-info-username">
									<router-link
										:to="{
											name: 'forums.topics.view',
											params: {
												slug: topic.slug,
												id: topic.id,
											},
											hash: '#forum-post-' + topic.latest_post.id,
											query: {
												page: getPostPage(topic),
												sort: sort,
											},
										}"
									>
										{{ topic.latest_post.user.display_name }}
										<AppUserVerifiedTick :user="topic.latest_post.user" />
									</router-link>
								</div>
								<div class="text-muted">@{{ topic.latest_post.user.username }}</div>
								<AppTimeAgo :date="topic.latest_post.posted_on" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./topic-list.styl" scoped></style>
