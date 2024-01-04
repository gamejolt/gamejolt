<script lang="ts" setup>
import { computed, PropType, ref, toRef, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import { styleWhen } from '../../../_styles/mixins';
import { getMediaserverUrlForBounds } from '../../../utils/image';
import AppButton from '../../button/AppButton.vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { formatNumber } from '../../filters/number';
import AppLoading from '../../loading/AppLoading.vue';
import { useCommonStore } from '../../store/common-store';
import AppTheme from '../../theme/AppTheme.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppUserDogtag from '../AppUserDogtag.vue';
import AppUserFollowButton from '../follow/AppUserFollowButton.vue';
import AppUserAvatarBubble from '../user-avatar/AppUserAvatarBubble.vue';
import AppUserAvatarImg from '../user-avatar/AppUserAvatarImg.vue';
import { UserModel } from '../user.model';

const props = defineProps({
	user: {
		type: Object as PropType<UserModel>,
		required: true,
	},
	isLoading: {
		type: Boolean,
	},
	elevate: {
		type: Boolean,
	},
	noStats: {
		type: Boolean,
	},
	disableFollowWidget: {
		type: Boolean,
	},
});

const { user, isLoading, elevate } = toRefs(props);

const headerElement = ref<HTMLElement>();

const { user: sessionUser } = useCommonStore();

const followerCount = toRef(() => user.value.follower_count || 0);
const followingCount = toRef(() => user.value.following_count || 0);
const postCount = toRef(() => user.value.post_count || 0);
const gameCount = toRef(() => user.value.game_count || 0);
const likeCount = toRef(() => user.value.like_count || 0);
const dogtags = toRef(() => user.value.dogtags || []);
const showTags = toRef(() => !!user.value.follows_you || dogtags.value.length > 0);

const headerBackgroundImage = computed(() => {
	let src = user.value.header_media_item?.mediaserver_url;
	if (src) {
		const { offsetWidth, offsetHeight } = headerElement.value || {};
		src = getMediaserverUrlForBounds({
			src,
			maxWidth: offsetWidth || 400,
			maxHeight: offsetHeight || 100,
		});
		return `url('${src}')`;
	}
	return undefined;
});
</script>

<template>
	<AppTheme
		class="user-card sheet sheet-full sheet-no-full-bleed"
		:class="{ 'sheet-elevate': elevate }"
		:theme="user.theme || undefined"
	>
		<div class="-user-info">
			<div
				ref="headerElement"
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<AppUserAvatarBubble
				class="-avatar"
				:user="user"
				show-verified
				show-frame
				verified-size="big"
				:verified-offset="0"
				verified-position="top-right"
				bg-color="bg"
			>
				<AppUserAvatarImg
					class="-avatar-img"
					:style="
						// Hide the border when there's an avatar frame.
						styleWhen(!!user.avatar_frame, {
							border: `none`,
						})
					"
					:user="user"
				/>
			</AppUserAvatarBubble>

			<div class="-well fill-bg">
				<div v-if="showTags" class="-tags">
					<AppUserDogtag v-for="tag of dogtags" :key="tag.text" :tag="tag" />

					<span v-if="user.follows_you" class="tag tag-highlight">
						<AppTranslate>Follows You</AppTranslate>
					</span>
				</div>

				<div class="-display-name">
					<RouterLink :to="user.url" class="link-unstyled">
						{{ user.display_name }}
					</RouterLink>
				</div>

				<div class="-username">
					<RouterLink :to="user.url" class="link-unstyled">
						@{{ user.username }}
					</RouterLink>
				</div>

				<div class="-follow-counts small">
					<RouterLink
						v-translate="{ count: formatNumber(followingCount) }"
						:to="{
							name: 'profile.following',
							params: { username: user.username },
						}"
						:translate-n="followingCount"
						translate-plural="<b>%{count}</b> following"
					>
						<b>1</b>
						following
					</RouterLink>
					<span class="dot-separator" />
					<RouterLink
						v-translate="{ count: formatNumber(followerCount) }"
						:to="{
							name: 'profile.followers',
							params: { username: user.username },
						}"
						:translate-n="followerCount"
						translate-plural="<b>%{count}</b> followers"
					>
						<b>1</b>
						follower
					</RouterLink>
				</div>

				<div v-if="sessionUser" class="-follow">
					<AppUserFollowButton
						v-if="user.id !== sessionUser.id"
						:user="user"
						location="card"
						block
						hide-count
						:disabled="disableFollowWidget"
					/>
					<AppButton
						v-else
						:to="{
							name: 'profile.overview',
							params: { username: sessionUser.username },
						}"
						block
					>
						<AppTranslate>View Profile</AppTranslate>
					</AppButton>
				</div>
			</div>
		</div>

		<div v-if="!noStats" class="-stats -well">
			<AppLoading v-if="isLoading" class="sans-margin" centered />
			<ul v-else class="stat-list">
				<li class="stat-big stat-big-smaller">
					<RouterLink
						class="link-unstyled"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<div class="stat-big-label">
							<AppTranslate>Posts</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(postCount) }}
						</div>
					</RouterLink>
				</li>
				<li v-if="gameCount" class="stat-big stat-big-smaller">
					<RouterLink
						class="link-unstyled"
						:to="{
							name: 'library.collection.developer',
							params: { id: user.username },
						}"
					>
						<div class="stat-big-label">
							<AppTranslate>Games</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatNumber(gameCount) }}
						</div>
					</RouterLink>
				</li>
				<li v-if="likeCount" class="stat-big stat-big-smaller">
					<RouterLink
						class="link-unstyled"
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<div class="stat-big-label">
							<AppTranslate>Likes</AppTranslate>
						</div>
						<div class="stat-big-digit">
							{{ formatFuzzynumber(likeCount) }}
						</div>
					</RouterLink>
				</li>
			</ul>
		</div>

		<slot name="trailing" />
	</AppTheme>
</template>

<style lang="stylus" src="./common.styl" scoped></style>
