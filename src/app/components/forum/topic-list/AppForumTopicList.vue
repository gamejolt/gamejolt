<script lang="ts" setup>
import { formatNumber } from '~common/filters/number';
import { ForumTopicModel } from '~common/forum/topic/topic.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { getScreen } from '~common/screen/screen-service';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppUserVerifiedTick from '~common/user/AppUserVerifiedTick.vue';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '~common/user/user-avatar/AppUserAvatar.vue';

type Props = {
	topics: ForumTopicModel[];
	sort: string;
	useUpvotes: boolean;
	postCountPerPage: number;
};

const { topics, sort, postCountPerPage } = defineProps<Props>();

const { isXs, isDesktop } = getScreen();

function getPostPage(topic: ForumTopicModel) {
	if (!postCountPerPage) {
		return undefined;
	}

	const page = Math.ceil((topic.replies_count || 0) / postCountPerPage);
	if (page === 1) {
		return undefined;
	}

	return page;
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
						:class="{ 'text-right': !isXs }"
					>
						<AppTranslate
							:translate-n="topic.replies_count || 0"
							translate-plural="%{ count } Replies"
							:translate-params="{ count: formatNumber(topic.replies_count || 0) }"
						>
							%{ count } Reply
						</AppTranslate>
						<br class="hidden-xs" />
						<span class="hidden-sm hidden-md hidden-lg dot-separator" />
						<AppTranslate
							:translate-n="topic.followers_count || 0"
							translate-plural="%{ count } Followers"
							:translate-params="{ count: formatNumber(topic.followers_count || 0) }"
						>
							%{ count } Follower
						</AppTranslate>
					</div>
					<div v-if="isDesktop && topic.latest_post" class="col-md-3 text-muted small">
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

<style lang="stylus" src="~app/components/forum/topic-list/topic-list.styl" scoped></style>
