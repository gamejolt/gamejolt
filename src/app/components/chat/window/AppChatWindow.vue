<script lang="ts" setup>
import { computed, PropType, ref, toRefs, watch, watchEffect } from 'vue';
import { RouterLink } from 'vue-router';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { SettingChatGroupShowMembers } from '../../../../_common/settings/settings.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { useAppStore } from '../../../store/index';
import { useGridStore } from '../../grid/grid-store';
import { leaveChatRoom } from '../client';
import FormChatRoomSettings from '../FormChatRoomSettings.vue';
import { ChatInviteModal } from '../invite-modal/invite-modal.service';
import AppChatMemberList from '../member-list/AppChatMemberList.vue';
import { ChatRoom, getChatRoomTitle } from '../room';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatWindowOutput from './output/AppChatWindowOutput.vue';
import AppChatWindowSend from './send/AppChatWindowSend.vue';

type SidebarTab = 'settings' | 'members';

const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});

const emit = defineEmits({
	'focus-change': (_focused: boolean) => true,
});

const { room } = toRefs(props);
const { toggleLeftPane } = useAppStore();
const { chatUnsafe: chat } = useGridStore();

let showSettingsOnMembersBack = false;

const friendAddJolticonVersion = ref<1 | 2>(1);
const sidebar = ref<SidebarTab | undefined>(
	!Screen.isXs && SettingChatGroupShowMembers.get() ? 'members' : undefined
);

watch(
	() => room.value.id,
	() => {
		if (sidebar.value === 'members' && room.value.isPmRoom) {
			sidebar.value = undefined;
		}
	}
);

watch(sidebar, (value, oldValue) => {
	if (!value) {
		showSettingsOnMembersBack = false;
		return;
	}

	if (value === 'members') {
		showSettingsOnMembersBack = oldValue === 'settings';
	}
});

const isShowingUsers = computed(() => sidebar.value === 'members');
const memberCollection = computed(() => room.value.memberCollection);
const membersCount = computed(() => formatNumber(room.value.member_count));
const roomTitle = computed(() => getChatRoomTitle(room.value));
const showMembersViewButton = computed(() => !room.value.isPmRoom && !Screen.isXs);

watchEffect(() => SettingChatGroupShowMembers.set(isShowingUsers.value));

function addGroup() {
	// When creating a group from a PM window,
	// we want to put the room user at the top of the list
	const initialUser = room.value.user;
	const invitableUsers = chat.value.friendsList.users.filter(i => i.id !== initialUser?.id);

	if (initialUser) {
		invitableUsers.unshift(initialUser);
	}

	// Give the InviteModal the initialUser so it can set them as invited by default
	ChatInviteModal.show(room.value, invitableUsers, initialUser);
}

function addMembers() {
	// Filter out the room members as we don't want to add them again.
	const members = memberCollection.value.users.map(i => i.id);
	const invitableUsers = chat.value.friendsList.users.filter(({ id }) => !members.includes(id));
	ChatInviteModal.show(room.value, invitableUsers);
}

function toggleSidebar(val: SidebarTab) {
	sidebar.value = sidebar.value === val ? undefined : val;
}

function close() {
	// xs size needs to show the friends list when closing the room.
	// any other size can close the whole chat instead
	if (Screen.isXs) {
		leaveChatRoom(chat.value);
	} else {
		toggleLeftPane();
	}
}

function onMobileAppBarBack() {
	if (showSettingsOnMembersBack) {
		sidebar.value = 'settings';
		showSettingsOnMembersBack = false;
	} else {
		sidebar.value = undefined;
	}
}
</script>

<template>
	<div class="chat-window">
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close chat. -->
		<div class="-close" @click="close" />
		<div class="-window">
			<div class="-close" @click="close" />

			<div :key="room.id" class="-window-main">
				<!-- Window Header -->
				<AppHeaderBar
					:key="room.id"
					class="-header"
					title-size="lg"
					:automatically-imply-leading="false"
					:elevation="2"
				>
					<template #leading>
						<AppButton
							v-if="Screen.isXs"
							v-app-tooltip="$gettext('Close')"
							circle
							trans
							icon="remove"
							style="margin-right: 4px"
							@click="close"
						/>

						<span
							v-if="!room.isPmRoom"
							class="-header-avatar anim-fade-in-enlarge no-animate-xs"
						>
							<div class="-header-icon">
								<AppJolticon icon="users" />
							</div>
						</span>
						<RouterLink
							v-else-if="room.user"
							class="anim-fade-in-enlarge no-animate-xs"
							:to="room.user.url"
						>
							<img class="-header-icon" :src="room.user.img_avatar" alt="" />
							<AppChatUserOnlineStatus
								class="-online-status"
								:is-online="room.user.isOnline"
								:size="12"
								:segment-width="1.5"
							/>
						</RouterLink>
					</template>

					<template #title>
						<div
							v-if="!room.isPmRoom"
							class="-header-name anim-fade-in-right no-animate-xs"
						>
							{{ roomTitle }}
						</div>
						<div
							v-else-if="room.user"
							class="-header-name anim-fade-in-right no-animate-xs"
							:title="`${room.user.display_name} (@${room.user.username})`"
						>
							<RouterLink class="link-unstyled" :to="room.user.url">
								{{ roomTitle }}
							</RouterLink>
							<AppUserVerifiedTick :user="room.user" />
							<div class="-header-name-username">@{{ room.user.username }}</div>
						</div>
					</template>

					<template #actions>
						<AppButton
							v-app-tooltip="
								room.isPmRoom
									? $gettext('Create group chat')
									: $gettext('Add friends')
							"
							class="-header-control anim-fade-in"
							circle
							trans
							:icon="`friend-add-${friendAddJolticonVersion}`"
							@mouseenter="friendAddJolticonVersion = 2"
							@mouseleave="friendAddJolticonVersion = 1"
							@click="room.isPmRoom ? addGroup() : addMembers()"
						/>

						<AppButton
							v-if="showMembersViewButton"
							v-app-tooltip="
								isShowingUsers ? $gettext('Hide members') : $gettext('Show members')
							"
							circle
							trans
							icon="users"
							class="-header-control anim-fade-in"
							:primary="sidebar === 'members'"
							:solid="sidebar === 'members'"
							@click="toggleSidebar('members')"
						/>

						<AppButton
							v-app-tooltip="$gettext(`Settings`)"
							circle
							sparse
							trans
							icon="ellipsis-h"
							:primary="sidebar === 'settings'"
							:solid="sidebar === 'settings'"
							@click="toggleSidebar('settings')"
						/>

						<AppButton
							v-if="!Screen.isXs"
							v-app-tooltip="$gettext('Close')"
							class="-header-control"
							circle
							trans
							icon="remove"
							@click="close"
						/>
					</template>
				</AppHeaderBar>

				<div class="-body">
					<div class="-chatting-section">
						<div class="-output">
							<AppChatWindowOutput
								:key="room.id"
								class="-output-inner"
								:room="room"
								:background="room.background"
								:overlay="!!room.background"
							/>
						</div>

						<div v-if="chat.currentUser" class="-send-container">
							<AppChatWindowSend
								:room="room"
								@focus-change="emit('focus-change', $event)"
							/>
						</div>
					</div>

					<div v-if="sidebar" class="-sidebar">
						<div v-if="Screen.isDesktop" class="-sidebar-shadow" />

						<div class="-sidebar-container">
							<AppHeaderBar v-if="Screen.isMobile" title-size="lg" center-title>
								<template #leading>
									<AppButton
										icon="chevron-left"
										trans
										sparse
										circle
										@click="onMobileAppBarBack"
									/>
								</template>

								<template #title>
									<template v-if="sidebar === 'settings'">
										<template v-if="room.isGroupRoom">
											<AppTranslate>Group Settings</AppTranslate>
										</template>
										<template v-else>
											<AppTranslate>Chat Settings</AppTranslate>
										</template>
									</template>
									<template v-else>
										<AppTranslate>Group Members</AppTranslate>
									</template>
								</template>

								<template #actions>
									<AppButton
										v-if="!room.isGroupRoom || sidebar === 'members'"
										v-app-tooltip="$gettext('Add friends')"
										class="-header-control"
										circle
										trans
										:icon="`friend-add-${friendAddJolticonVersion}`"
										@mouseenter="friendAddJolticonVersion = 2"
										@mouseleave="friendAddJolticonVersion = 1"
										@click="room.isPmRoom ? addGroup() : addMembers()"
									/>
								</template>
							</AppHeaderBar>

							<template v-if="sidebar === 'settings'">
								<AppScrollScroller>
									<FormChatRoomSettings
										:room="room"
										:show-members-preview="
											(!showMembersViewButton || Screen.isMobile) &&
											room.isGroupRoom
										"
										:members="memberCollection.users"
										:style="{
											paddingTop: Screen.isXs ? '16px' : undefined,
										}"
										@view-members="sidebar = 'members'"
									/>
								</AppScrollScroller>
							</template>
							<template v-else-if="sidebar === 'members'">
								<div v-if="Screen.isDesktop" class="-header-members">
									<AppTranslate>Members</AppTranslate>
									<span> ({{ membersCount }}) </span>
								</div>

								<AppChatMemberList
									v-if="memberCollection"
									:collection="memberCollection"
									:room="room"
								/>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
$-zindex-close = 0
$-zindex-window-inner = 1
$-zindex-sidebar-shadow = 2
$-zindex-input = 3
$-zindex-header = 4

$-zindex-sidebar-mobile = 10

.chat-window
	position: fixed
	display: flex
	justify-content: center
	align-items: flex-start
	z-index: $zindex-chat-window
	padding: 16px 20px 16px 16px

.-close
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	background: transparent
	z-index: $-zindex-close

.-window
	change-bg(bg)
	position: relative
	display: flex
	flex: auto
	justify-content: center
	width: 100%
	height: 100%
	z-index: $-zindex-window-inner
	overflow: hidden

	@media $media-xs
		position: fixed
		top: 0
		right: 0
		left: 0
		bottom: 0
		height: auto !important
		width: auto !important

	@media $media-sm-up
		rounded-corners-lg()

.-window-main
	position: relative
	flex: auto
	display: flex
	flex-direction: column
	min-width: 0
	z-index: $-zindex-window-inner

.-header
	z-index: $-zindex-header

.-header-icon
	img-circle()
	display: flex
	align-items: center
	justify-content: center
	width: 36px
	height: 36px
	background-color: var(--theme-backlight)

	::v-deep(.jolticon)
		color: var(--theme-backlight-fg)

.-online-status
	position: absolute
	right: 0
	bottom: 0

.-header-name
	text-overflow()

.-header-name-username
	font-family: $font-family-base
	font-size: 13px
	line-height: 18px
	font-weight: 400
	color: var(--theme-fg-muted)

.-header-control
	position: relative
	vertical-align: top
	margin-left: 4px

.-header-members
	font-family: $font-family-heading
	font-size: 19px
	font-weight: 800
	padding: 24px 16px 16px

.-body
	display: flex
	flex: auto

.-chatting-section
	display: flex
	flex-direction: column
	flex: auto
	min-width: 0
	flex-basis: 480px

.-sidebar
	position: relative
	width: 320px
	flex: 0 1 320px

	@media $media-mobile
		position: fixed
		z-index: $-zindex-sidebar-mobile
		left: 0
		top: 0
		right: 0
		bottom: 0
		change-bg(bg)
		width: unset

.-sidebar-shadow
	position: absolute
	top: 0
	bottom: 0
	left: 0
	width: 8px
	background: linear-gradient(to right, rgba($black, 0.2), transparent)
	z-index: $-zindex-sidebar-shadow

.-output
	change-bg(bg-offset)
	position: relative
	flex: auto
	display: flex
	height: 100%

.-sidebar-container
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	display: flex
	flex-direction: column

.-output-inner
	// Allows the scroll bar some breathing room
	padding-right: 4px

.-send-container
	width: 100%
	flex: none
	z-index: $-zindex-input
</style>
