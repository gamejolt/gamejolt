<script lang="ts" setup>
import { toRef } from 'vue';
import { useRouter } from 'vue-router';

import AppCommunityJoinWidget from '~app/components/community/AppCommunityJoinWidget.vue';
import { showCommunitySidebarModal } from '~app/components/community/sidebar/modal/modal.service';
import { useAppStore } from '~app/store';
import AppEditableThumbnail from '~app/views/communities/view/_editable-thumbnail/AppEditableThumbnail.vue';
import { useCommunityRouteStore } from '~app/views/communities/view/view.store';
import AppButton from '~common/button/AppButton.vue';
import AppCommunityVerifiedTick from '~common/community/verified-tick/AppCommunityVerifiedTick.vue';
import { Environment } from '~common/environment/environment.service';
import { formatNumber } from '~common/filters/number';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import { hideAllPoppers } from '~common/popper/popper.service';
import { Screen } from '~common/screen/screen-service';
import { copyShareLink } from '~common/share/share.service';
import { useSidebarStore } from '~common/sidebar/sidebar.store';
import { useCommonStore } from '~common/store/common-store';
import AppTheme from '~common/theme/AppTheme.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { getAbsoluteLink } from '~utils/router';

type Props = {
	hasUnread?: boolean;
};
defineProps<Props>();
const routeStore = useCommunityRouteStore()!;
const { toggleLeftPane } = useAppStore();
const { user } = useCommonStore();
const { activeContextPane } = useSidebarStore();
const router = useRouter();

const community = toRef(() => routeStore.community);
const channel = toRef(() => routeStore.channel);
const sidebarData = toRef(() => routeStore.sidebarData);
const channelPath = toRef(() => routeStore.channelPath);

const memberCount = toRef(() => community.value.member_count || 0);
const shouldShowModTools = toRef(() => user.value?.isMod === true);
const shouldShowChannelsMenu = toRef(() => !!activeContextPane.value);
const isJam = toRef(() => channel.value?.type === 'competition');

const shouldShowAbout = toRef(() => {
	// It's too confusing to see an "About" button for the community as well
	// as the jam info.
	if (isJam.value) {
		return false;
	}

	if (sidebarData.value) {
		return Screen.isMobile;
	}

	return false;
});

function onClickMenu() {
	toggleLeftPane('context');
}

function onClickAbout() {
	if (sidebarData.value) {
		showCommunitySidebarModal({
			sidebarData: sidebarData.value,
			community: community.value,
		});
	}
}

function onClickExtrasOption() {
	hideAllPoppers();
}

function copyShareUrl() {
	const url = getAbsoluteLink(router, community.value.routeLocation);
	copyShareLink(url, 'community');

	hideAllPoppers();
}
</script>

<template>
	<AppTheme class="-community-card" :theme="community.theme">
		<div class="-well">
			<!-- Thumbnail -->
			<div class="-thumbnail">
				<div class="-thumbnail-inner">
					<AppEditableThumbnail />
				</div>
				<AppCommunityVerifiedTick class="-verified" :community="community" />
			</div>

			<!-- Name / Members -->
			<div class="-details">
				<div class="-name">
					<RouterLink :to="community.routeLocation" class="link-unstyled">
						{{ community.name }}
					</RouterLink>
				</div>

				<div class="-members small">
					<RouterLink
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<AppTranslate
							:translate-n="memberCount"
							translate-plural="%{count} members"
							:translate-params="{ count: formatNumber(memberCount) }"
						>
							%{count} member
						</AppTranslate>
					</RouterLink>
				</div>
			</div>
		</div>

		<!-- Button Controls -->
		<div class="-controls">
			<!-- Context Menu -->
			<div v-if="shouldShowChannelsMenu" class="-controls-item -menu">
				<AppButton
					icon="menu"
					trans
					:sparse="Screen.isXs && shouldShowAbout"
					:circle="Screen.isXs && shouldShowAbout"
					@click="onClickMenu"
				>
					<div v-if="hasUnread" class="-unread-blip" />
					<template v-if="!Screen.isXs || !shouldShowAbout">
						<template v-if="channelPath">
							{{ $gettext(`Channels`) }}
						</template>
						<template v-else>{{ $gettext(`Menu`) }}</template>
					</template>
				</AppButton>
			</div>

			<div class="-spacer" />

			<!-- Join / Edit / View -->
			<div v-if="!community.hasPerms()" class="-controls-item -controls-primary">
				<AppCommunityJoinWidget
					:community="community"
					block
					hide-count
					location="communityPage"
				/>
			</div>

			<!-- About -->
			<div v-if="shouldShowAbout" class="-controls-item -about">
				<AppButton trans @click="onClickAbout">
					{{ $gettext(`About`) }}
				</AppButton>
			</div>

			<!-- Popover Extras -->
			<AppPopper class="-controls-item -extra" popover-class="fill-darkest">
				<AppButton class="link-unstyled" icon="ellipsis-v" trans sparse circle />

				<template #popover>
					<div class="list-group list-group-dark">
						<a class="list-group-item has-icon" @click="copyShareUrl">
							<AppJolticon icon="link" />
							{{ $gettext(`Copy link to community`) }}
						</a>
						<a
							v-if="shouldShowModTools"
							class="list-group-item has-icon"
							:href="
								Environment.baseUrl + `/moderate/communities/view/${community.id}`
							"
							target="_blank"
							@click="onClickExtrasOption"
						>
							<AppJolticon icon="cog" />
							<span>Moderate Community</span>
						</a>
					</div>
				</template>
			</AppPopper>
		</div>
	</AppTheme>
</template>

<style lang="stylus" scoped>
$-thumbnail-size = 80px
$-thumbnail-size-sm = 48px
$-bg-color-base = var(--theme-bg)

.-unread-blip
	position: absolute
	top: 16px
	left: 24px
	height: 12px
	width: 12px
	border: $border-width-large solid var(--theme-bg)
	background-color: var(--theme-fg)
	border-radius: 50%
	pointer-events: none

	@media $media-xs
		left: 18px

.popper-wrapper .-community-card
	min-width: 300px

.-community-card
	position: relative
	display: flex
	background-color: $-bg-color-base
	padding: 8px

	@media $media-mobile
		flex-direction: column

	@media $media-xs
		elevate-xs()

	@media $media-sm-up
		elevate-1()

.-well
	flex: none
	display: flex
	align-items: flex-start
	min-width: 0

	@media $media-mobile
		padding-right: 32px

	.-details
		padding-right: 8px

	.-name
		font-weight: bold
		font-size: $font-size-large

.-thumbnail
	position: relative
	display: block
	margin-right: 8px
	width: $-thumbnail-size-sm
	height: $-thumbnail-size-sm
	z-index: 2
	flex: none

	&
	&-inner
		img-circle()

	&-inner
		overflow: hidden
		height: 100%
		background-color: var(--theme-bg-subtle)

	.-verified
		filter: drop-shadow(1px 1px $-bg-color-base) drop-shadow(-1px 1px $-bg-color-base) drop-shadow(1px -1px $-bg-color-base) drop-shadow(-1px -1px $-bg-color-base)
		position: absolute
		bottom: -($border-width-base)
		right: -($border-width-base)
		font-size: $jolticon-size

.-channel-info
	border-bottom: $border-width-base solid var(--theme-bg-subtle)
	padding-top: 12px
	margin-bottom: 14px

.-controls
	clear: both
	margin-top: $line-height-computed
	display: flex
	align-items: center

	.-spacer
		flex: auto

		@media $media-md-up
			flex: none

	&-item
		margin: 0 4px

	.button
		position: relative

		&:hover
			.-unread-blip
				border-color: var(--theme-bg-actual)
				background-color: var(--theme-bi-fg)

	@media $media-xs
		.-menu
			margin-right: 8px

			:deep(.jolticon)
				margin: 0

	&-primary
		flex: auto
		max-width: 240px

		@media $media-mobile
			margin-left: auto

	.-extra
		position: absolute
		top: 4px
		right: 0

	@media $media-md-up
		flex: auto
		margin-top: 0
		padding-left: 8px
		justify-content: flex-end

		&-primary
			order: 3

		.-extra
			order: 4
			position: static
</style>
