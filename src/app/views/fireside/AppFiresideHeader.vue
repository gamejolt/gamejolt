<script lang="ts" setup>
import { toRefs } from 'vue';
import { RouterLink } from 'vue-router';
import AppCommunityThumbnailImg from '../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import { Screen } from '../../../_common/screen/screen-service';
import AppStickerLiveReactions from '../../../_common/sticker/live-reactions/AppStickerLiveReactions.vue';
import AppTheme from '../../../_common/theme/AppTheme.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { useFiresideController } from '../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../components/fireside/stream/setup/setup-modal.service';
import { FiresideChatMembersModal } from './_chat-members/modal/modal.service';
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
});

const { showControls, hasChatStats, overlay } = toRefs(props);

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
			<div class="-leading">
				<div class="-title-wrapper">
					<div class="-title" :title="fireside.title">
						{{ fireside.title }}
					</div>

					<span v-if="isDraft" class="-tag tag">
						<AppTranslate>Private</AppTranslate>
					</span>

					<span v-if="fireside.primaryCommunityLink?.isFeatured" class="-tag tag">
						<AppTranslate>Featured</AppTranslate>
					</span>
				</div>

				<div class="-communities">
					<div v-if="fireside.community" class="-community">
						<div class="-community-avatar">
							<AppCommunityThumbnailImg :community="fireside.community" />
						</div>
						<RouterLink :to="fireside.community.routeLocation">
							{{ fireside.community.name }}
						</RouterLink>
					</div>
				</div>
			</div>

			<div v-if="!Screen.isXs" class="-live-reactions">
				<AppStickerLiveReactions :controller="stickerTargetController" reverse />
			</div>

			<!-- <div v-if="hasChatStats && chatUsers" class="-member-stats">
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
			<div v-if="showControls" class="-controls">
				<div v-if="shouldShowStreamingOptions && !isPersonallyStreaming" class="-stats-btn">
					<AppButton
						v-app-tooltip="$gettext(`Start Stream / Voice Chat`)"
						icon="broadcast"
						circle
						trans
						@click="onClickEditStream"
					/>
				</div>

				{{ ' ' }}

				<AppFiresideSettingsPopper @show="onShowPopper" @hide="onHidePopper">
					<div class="-stats-btn">
						<AppButton icon="ellipsis-v" circle sparse solid />
					</div>
				</AppFiresideSettingsPopper>
			</div> -->
		</template>
	</AppTheme>
</template>

<style lang="stylus" scoped>
.-overlay
	*
		fireside-overlay-text-shadow()
		color: white

.fireside-header
	display: flex
	align-items: center

.-leading
	flex: auto

.-title-wrapper
	flex: auto
	display: flex
	align-items: center
	gap: 12px

.-title
	text-overflow()
	flex: none
	font-size: 24px
	font-weight: 800

.-tag
	margin-left: 4px

.-communities
	display: flex
	gap: 8px

.-community
	display: flex
	align-items: center
	font-weight: 700

.-community-avatar
	width: 16px
	height: 16px
	margin-right: 4px

// .-member-stats
// 	flex: none
// 	margin-left: 12px
// 	margin-right: 24px

// .-controls
// 	flex: none
// 	margin-left: 12px
// 	white-space: nowrap

// .-stats-btn
// 	display: inline-block
// 	position: relative

// .-stats-btn-warn
// 	change-bg('bg-offset')
// 	rounded-corners()
// 	position: absolute
// 	left: -8px
// 	top: -8px
// 	pointer-events: none
// 	padding: 2px
</style>
