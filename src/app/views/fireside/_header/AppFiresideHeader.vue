<script lang="ts">
import { toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerLiveReactions from '../../../../_common/sticker/live-reactions/AppStickerLiveReactions.vue';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import { FiresideChatMembersModal } from '../_chat-members/modal/modal.service';
import AppFiresideSettingsPopper from '../_settings-popper/AppFiresideSettingsPopper.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	showControls: {
		type: Boolean,
	},
	hasChatStats: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	dense: {
		type: Boolean,
	},
});

const { showControls, hasChatStats, overlay, dense } = toRefs(props);

const c = useFiresideController()!;
const {
	fireside,
	chatUsers,
	chatRoom,
	isShowingOverlayPopper,
	isDraft,
	isPersonallyStreaming,
	stickerTargetController,
	shouldShowStreamingOptions,
} = c;

function onClickShowChatMembers() {
	if (!chatUsers.value || !chatRoom.value) {
		return;
	}

	FiresideChatMembersModal.show(chatUsers.value, chatRoom.value);
}

function onClickEditStream() {
	StreamSetupModal.show(c);
}

function onShowPopper() {
	if (overlay) {
		isShowingOverlayPopper.value = true;
	}
}

function onHidePopper() {
	isShowingOverlayPopper.value = false;
}
</script>

<template>
	<AppTheme class="fireside-header" :class="{ '-overlay': overlay }" :force-dark="overlay">
		<template v-if="fireside">
			<div class="-fireside-title">
				<h2
					class="sans-margin-top"
					:class="{ h3: Screen.isXs, 'sans-margin-bottom': dense }"
				>
					<small class="-subtitle">
						<router-link
							:to="{
								name: 'profile.overview',
								params: { username: fireside.user.username },
							}"
						>
							@{{ fireside.user.username }}
						</router-link>
						{{ ' ' }}
						<AppUserAvatarImg class="-avatar" :user="fireside.user" />
						<span>'s Fireside</span>

						<template v-if="fireside.community">
							{{ ' ' }}
							<span>in </span>
							<div class="-avatar">
								<AppCommunityThumbnailImg :community="fireside.community" />
							</div>
							{{ ' ' }}
							<router-link :to="fireside.community.routeLocation">
								{{ fireside.community.name }}
							</router-link>
						</template>

						<span v-if="isDraft" class="-tag tag">
							<AppTranslate>Draft</AppTranslate>
						</span>

						<span
							v-if="
								fireside.primaryCommunityLink &&
								fireside.primaryCommunityLink.isFeatured
							"
							class="-tag tag"
						>
							<AppTranslate>Featured</AppTranslate>
						</span>
					</small>
					<div class="-fireside-title-text" :title="fireside.title">
						{{ fireside.title }}
					</div>
				</h2>

				<div v-if="!Screen.isXs" class="-live-reactions">
					<AppStickerLiveReactions :controller="stickerTargetController" reverse />
				</div>

				<div v-if="hasChatStats && chatUsers" class="-fireside-title-member-stats">
					<ul class="stat-list">
						<a @click="onClickShowChatMembers">
							<li class="stat-big stat-big-smaller">
								<div class="stat-big-label">Members</div>
								<div class="stat-big-digit">
									{{ formatNumber(chatUsers.count) }}
								</div>
							</li>
						</a>
					</ul>
				</div>
				<div v-if="showControls" class="-fireside-title-controls">
					<div
						v-if="shouldShowStreamingOptions && !isPersonallyStreaming"
						class="-stats-btn"
					>
						<AppButton
							v-app-tooltip="$gettext(`Start Stream / Voice Chat`)"
							icon="broadcast"
							circle
							trans
							@click="onClickEditStream"
						/>
					</div>

					{{ ' ' }}

					<AppFiresideSettingsPopper
						:overlay="overlay"
						@show="onShowPopper"
						@hide="onHidePopper"
					>
						<div class="-stats-btn">
							<AppButton
								icon="ellipsis-v"
								circle
								sparse
								solid
								:trans="overlay"
								:overlay="overlay"
							/>
						</div>
					</AppFiresideSettingsPopper>
				</div>
			</div>
		</template>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-overlay
	*
		fireside-overlay-text-shadow()

		&:not(a)
			color: white

	.-subtitle
		font-weight: 600
		opacity: 0.75

.-fireside-title
	display: flex
	align-items: center

	.-fireside-title-text
	h2
		text-overflow()
		flex: auto

.-fireside-title-controls
	flex: none
	margin-left: 12px
	white-space: nowrap

.-subtitle
	*
		vertical-align: middle

.-avatar
	width: 16px
	height: 16px
	display: inline-block

.-stats-btn
	display: inline-block
	position: relative

.-stats-btn-warn
	change-bg('bg-offset')
	rounded-corners()
	position: absolute
	left: -8px
	top: -8px
	pointer-events: none
	padding: 2px

.-tag
	margin-left: 4px

.-live-reactions
	padding: 0 16px
</style>
