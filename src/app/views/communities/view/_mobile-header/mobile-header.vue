<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppCommunityJoinWidget from '../../../../../_common/community/join-widget/AppCommunityJoinWidget.vue';
import AppCommunityVerifiedTick from '../../../../../_common/community/verified-tick/AppCommunityVerifiedTick.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../_common/filters/number';
import AppPopper from '../../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../../_common/popper/popper.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import { copyShareLink } from '../../../../../_common/share/share.service';
import { useSidebarStore } from '../../../../../_common/sidebar/sidebar.store';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTheme from '../../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { getAbsoluteLink } from '../../../../../utils/router';
import { showCommunitySidebarModal } from '../../../../components/community/sidebar/modal/modal.service';
import { useAppStore } from '../../../../store';
import AppEditableThumbnail from '../_editable-thumbnail/editable-thumbnail.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../view.store';

@Options({
	components: {
		AppPopper,
		AppTheme,
		AppCommunityVerifiedTick,
		AppEditableThumbnail,
		AppCommunityJoinWidget,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppMobileHeader extends Vue {
	@Prop({ type: Boolean, default: false }) hasUnread!: boolean;

	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	sidebarStore = setup(() => useSidebarStore());

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get user() {
		return this.commonStore.user;
	}
	get activeContextPane() {
		return this.sidebarStore.activeContextPane;
	}

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	get community() {
		return this.routeStore.community;
	}

	get channel() {
		return this.routeStore.channel;
	}

	get memberCount() {
		return this.community.member_count || 0;
	}

	get shouldShowModTools() {
		return this.user?.isMod === true;
	}

	get isFeaturedChannel() {
		return this.routeStore.channelPath === 'featured';
	}

	get shouldShowChannelsMenu() {
		return !!this.activeContextPane;
	}

	get isJam() {
		return this.channel?.type === 'competition';
	}

	get shouldShowAbout() {
		// It's too confusing to see an "About" button for the community as well
		// as the jam info.
		if (this.isJam) {
			return false;
		}

		if (this.routeStore.sidebarData) {
			return Screen.isMobile;
		}

		return false;
	}

	onClickMenu() {
		this.store.toggleLeftPane('context');
	}

	onClickAbout() {
		const { sidebarData, community } = this.routeStore;

		if (sidebarData) {
			showCommunitySidebarModal({
				isEditing: false,
				sidebarData,
				community,
			});
		}
	}

	onClickExtrasOption() {
		Popper.hideAll();
	}

	copyShareUrl() {
		const url = getAbsoluteLink(this.$router, this.community.routeLocation);
		copyShareLink(url, 'community');

		Popper.hideAll();
	}
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
					<router-link :to="community.routeLocation" class="link-unstyled">
						{{ community.name }}
					</router-link>
				</div>

				<div class="-members small">
					<router-link
						v-app-track-event="`community-mobile-header:community-members`"
						v-translate="{ count: formatNumber(memberCount) }"
						:translate-n="memberCount"
						translate-plural="<b>%{count}</b> members"
						:to="{
							name: 'communities.view.members',
							params: { path: community.path },
						}"
					>
						<b>1</b>
						member
					</router-link>
				</div>
			</div>
		</div>

		<!-- Button Controls -->
		<div class="-controls">
			<!-- Context Menu -->
			<div v-if="shouldShowChannelsMenu" class="-controls-item -menu">
				<AppButton
					v-app-track-event="`community-mobile-header:toggle-context`"
					icon="menu"
					trans
					:sparse="Screen.isXs && shouldShowAbout"
					:circle="Screen.isXs && shouldShowAbout"
					@click="onClickMenu"
				>
					<div v-if="hasUnread" class="-unread-blip" />
					<template v-if="!Screen.isXs || !shouldShowAbout">
						<AppTranslate v-if="routeStore && routeStore.channelPath">
							Channels
						</AppTranslate>
						<AppTranslate v-else>Menu</AppTranslate>
					</template>
				</AppButton>
			</div>

			<div class="-spacer" />

			<!-- Join / Edit / View -->
			<div v-if="!community.hasPerms()" class="-controls-item -controls-primary">
				<AppCommunityJoinWidget
					:community="community"
					:disabled="!!community.user_block"
					block
					hide-count
					location="communityPage"
				/>
			</div>

			<!-- About -->
			<div
				v-if="shouldShowAbout"
				v-app-track-event="`community-mobile-header:community-about`"
				class="-controls-item -about"
			>
				<AppButton trans @click="onClickAbout">
					<AppTranslate>About</AppTranslate>
				</AppButton>
			</div>

			<!-- Popover Extras -->
			<AppPopper class="-controls-item -extra" popover-class="fill-darkest">
				<AppButton class="link-unstyled" icon="ellipsis-v" trans sparse circle />

				<template #popover>
					<div class="list-group list-group-dark">
						<a
							v-app-track-event="`copy-link:community`"
							class="list-group-item has-icon"
							@click="copyShareUrl"
						>
							<AppJolticon icon="link" />
							<AppTranslate>Copy link to community</AppTranslate>
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

			::v-deep(.jolticon)
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
