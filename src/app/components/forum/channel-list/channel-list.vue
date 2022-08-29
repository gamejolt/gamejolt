<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { arrayIndexByFunc } from '../../../../utils/array';
import { formatNumber } from '../../../../_common/filters/number';
import { ForumCategory } from '../../../../_common/forum/category/category.model';
import { ForumChannel } from '../../../../_common/forum/channel/channel.model';
import { ForumPost } from '../../../../_common/forum/post/post.model';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTimeAgo } from '../../../../_common/time/ago/ago';
import AppUserCardHover from '../../../../_common/user/card/AppUserCardHover.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';

@Options({
	components: {
		AppUserCardHover,
		AppUserAvatar,
		AppTimeAgo,
		AppUserVerifiedTick,
	},
})
export default class AppForumChannelList extends Vue {
	@Prop(Object) category!: ForumCategory;
	@Prop(Array) channels!: ForumChannel[];
	@Prop({ type: Array, default: [] })
	latestPosts!: ForumPost[];
	@Prop(Number) postCountPerPage!: number;

	readonly formatNumber = formatNumber;
	readonly Screen = Screen;

	get indexedPosts() {
		return arrayIndexByFunc(this.latestPosts, item => item.topic!.channel_id);
	}

	getPostPage(post: ForumPost) {
		if (!this.postCountPerPage) {
			return undefined;
		}

		const page = Math.ceil((post.topic.replies_count || 0) / this.postCountPerPage);
		if (page === 1) {
			return undefined;
		}

		return page;
	}
}
</script>

<template>
	<div class="forum-channel-list">
		<div v-for="channel of channels" :key="channel.id" class="forum-channel-list-item row">
			<div class="col-sm-9 col-md-7">
				<h4>
					<span v-if="channel.notifications_count" class="tag tag-highlight">
						{{ formatNumber(channel.notifications_count || 0) }}
					</span>
					<router-link
						class="link-unstyled"
						:to="{
							name: 'forums.channels.view',
							params: { name: channel.name, sort: 'archived' },
						}"
					>
						#{{ channel.name }}
					</router-link>
				</h4>
				<div>
					{{ channel.description }}
				</div>
			</div>
			<div class="col-sm-3 col-md-2 text-muted small" :class="{ 'text-right': !Screen.isXs }">
				<span
					v-translate="{ count: formatNumber(channel.topics_count || 0) }"
					:translate-n="channel.topics_count || 0"
					translate-plural="<b>%{ count }</b> Topics"
				>
					<b>%{ count }</b>
					Topic
				</span>

				<br class="hidden-xs" />
				<span class="hidden-sm hidden-md hidden-lg dot-separator" />

				<span
					v-translate="{ count: formatNumber(channel.replies_count || 0) }"
					:translate-n="channel.replies_count || 0"
					translate-plural="<b>%{ count }</b> Replies"
				>
					<b>%{ count }</b>
					Reply
				</span>
			</div>
			<div v-if="Screen.isDesktop" class="col-md-3">
				<template v-if="indexedPosts[channel.id]">
					<template v-for="latestPost of [indexedPosts[channel.id]]" :key="latestPost.id">
						<div class="forum-channel-list-item-latest-topic clearfix">
							<div class="forum-channel-list-item-latest-topic-avatar">
								<AppUserCardHover :user="latestPost.user">
									<AppUserAvatar :user="latestPost.user" />
								</AppUserCardHover>
							</div>

							<div class="forum-channel-list-item-latest-topic-info">
								<div class="forum-channel-list-item-latest-topic-info-title">
									<router-link
										:to="{
											name: 'forums.topics.view',
											params: {
												slug: latestPost.topic.slug,
												id: latestPost.topic.id,
											},
											hash: '#forum-post-' + latestPost.id,
											query: {
												page: getPostPage(latestPost),
											},
										}"
									>
										{{ latestPost.topic.title }}
									</router-link>
								</div>
								<div class="text-muted">
									<AppTranslate>by</AppTranslate>
									{{ ' ' }}
									<strong>
										<router-link
											class="link-muted"
											:to="{
												name: 'profile.overview',
												params: { username: latestPost.user.username },
											}"
										>
											{{ latestPost.user.display_name }}
											<AppUserVerifiedTick :user="latestPost.user" small />
										</router-link>
									</strong>
									{{ ' ' }}
									<span class="tiny">@{{ latestPost.user.username }}</span>
								</div>
								<div class="text-muted">
									<AppTimeAgo :date="latestPost.posted_on" />
								</div>
							</div>
						</div>
					</template>
				</template>
				<template v-else> -- </template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.forum-channel-list-item
	margin-bottom: $font-size-base * 2

	h4
		font-weight: bold
		margin: 0

		@media $media-xs
			margin-bottom: 10px

	&-latest-topic
		font-size: $font-size-small

		&-avatar
			float: right
			margin-left: 10px
			width: 40px

		&-info
			&-title
				text-overflow()
				font-weight: bold

			&-user
				text-overflow()
</style>
