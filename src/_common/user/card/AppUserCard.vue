<script lang="ts" setup>
import { computed, toRef, useTemplateRef } from 'vue';
import { RouterLink } from 'vue-router';

import AppButton from '~common/button/AppButton.vue';
import { formatFuzzynumber } from '~common/filters/fuzzynumber';
import { formatNumber } from '~common/filters/number';
import AppLoading from '~common/loading/AppLoading.vue';
import { useCommonStore } from '~common/store/common-store';
import AppTheme from '~common/theme/AppTheme.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import AppUserDogtag from '~common/user/AppUserDogtag.vue';
import AppUserFollowButton from '~common/user/follow/AppUserFollowButton.vue';
import { UserModel } from '~common/user/user.model';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import AppUserAvatarImg from '~common/user/user-avatar/AppUserAvatarImg.vue';
import { styleWhen } from '~styles/mixins';
import { getMediaserverUrlForBounds } from '~utils/image';

type Props = {
	user: UserModel;
	isLoading?: boolean;
	elevate?: boolean;
	noStats?: boolean;
	disableFollowWidget?: boolean;
};
const { user, isLoading, elevate } = defineProps<Props>();

const headerElement = useTemplateRef('headerElement');

const { user: sessionUser } = useCommonStore();

const followerCount = toRef(() => user.follower_count || 0);
const followingCount = toRef(() => user.following_count || 0);
const postCount = toRef(() => user.post_count || 0);
const gameCount = toRef(() => user.game_count || 0);
const likeCount = toRef(() => user.like_count || 0);
const dogtags = toRef(() => user.dogtags || []);
const showTags = toRef(() => !!user.follows_you || dogtags.value.length > 0);

const headerBackgroundImage = computed(() => {
	let src = user.header_media_item?.mediaserver_url;
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
					<strong>
						{{
							$ngettext(`1 following`, `%{ count } following`, followingCount, {
								count: formatNumber(followingCount),
							})
						}}
					</strong>

					<span class="dot-separator" />

					<strong>
						{{
							$ngettext(`1 follower`, `%{ count } followers`, followerCount, {
								count: formatNumber(followerCount),
							})
						}}
					</strong>
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

<style lang="stylus" src="~common/user/card/common.styl" scoped></style>
