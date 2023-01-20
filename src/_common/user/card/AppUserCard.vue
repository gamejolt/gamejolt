<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppUserDogtag from '../../../app/components/user/AppUserDogtag.vue';
import { getMediaserverUrlForBounds } from '../../../utils/image';
import AppButton from '../../button/AppButton.vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';
import { formatNumber } from '../../filters/number';
import AppLoading from '../../loading/AppLoading.vue';
import { useCommonStore } from '../../store/common-store';
import AppTheme from '../../theme/AppTheme.vue';
import AppTranslate from '../../translate/AppTranslate.vue';
import AppUserFollowButton from '../follow/AppUserFollowButton.vue';
import AppUserAvatarFrame from '../user-avatar/AppUserAvatarFrame.vue';
import AppUserAvatarImg from '../user-avatar/AppUserAvatarImg.vue';
import { User } from '../user.model';
import AppUserVerifiedTick from '../verified-tick/AppUserVerifiedTick.vue';

const props = defineProps({
	user: {
		type: Object as PropType<User>,
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

const commonStore = useCommonStore();

const appUser = computed(() => commonStore.user.value);

const followerCount = computed(() => user.value.follower_count || 0);
const followingCount = computed(() => user.value.following_count || 0);
const postCount = computed(() => user.value.post_count || 0);
const gameCount = computed(() => user.value.game_count || 0);
const likeCount = computed(() => user.value.like_count || 0);
const theme = computed(() => (user.value.theme ? user.value.theme : undefined));

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

const dogtags = computed(() => user.value.dogtags || []);
const showTags = computed(() => !!user.value.follows_you || dogtags.value.length > 0);
</script>

<template>
	<AppTheme
		class="user-card sheet sheet-full sheet-no-full-bleed"
		:class="{ 'sheet-elevate': elevate }"
		:theme="theme"
	>
		<div class="-user-info">
			<div
				ref="headerElement"
				class="-header"
				:style="{
					'background-image': headerBackgroundImage,
				}"
			/>

			<AppUserAvatarFrame :user="user" class="-avatar">
				<RouterLink :to="user.url" class="-avatar-img">
					<AppUserAvatarImg :user="user" />
				</RouterLink>
			</AppUserAvatarFrame>

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
						<AppUserVerifiedTick :user="user" />
					</RouterLink>
				</div>

				<div class="-username">
					<RouterLink :to="user.url" class="link-unstyled">
						@{{ user.username }}
					</RouterLink>
				</div>

				<div class="-follow-counts small">
					<RouterLink
						v-translate="{ count: formatNumber(followingCount || 0) }"
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

				<div v-if="appUser" class="-follow">
					<AppUserFollowButton
						v-if="user.id !== appUser.id"
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
							params: { username: appUser.username },
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
