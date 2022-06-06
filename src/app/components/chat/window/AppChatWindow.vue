<script lang="ts">
import { computed, inject, PropType, ref, toRefs, watch, watchEffect } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppHeaderBar from '../../../../_common/header/AppHeaderBar.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { SettingChatGroupShowMembers } from '../../../../_common/settings/settings.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import { useAppStore } from '../../../store/index';
import { ChatStoreKey } from '../chat-store';
import { leaveChatRoom } from '../client';
import FormChatRoomSettings from '../FormChatRoomSettings.vue';
import { ChatInviteModal } from '../invite-modal/invite-modal.service';
import AppChatMemberList from '../member-list/AppChatMemberList.vue';
import { ChatRoom, getChatRoomTitle } from '../room';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatWindowOutput from './output/AppChatWindowOutput.vue';
import AppChatWindowSend from './send/AppChatWindowSend.vue';

type SidebarTab = 'settings' | 'members';
</script>

<script lang="ts" setup>
const props = defineProps({
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	hideClose: {
		type: Boolean,
	},
	hideAddMembers: {
		type: Boolean,
	},
	/** Causes the sidebar content to replace/cover the chat while showing. */
	fullSidebar: {
		type: Boolean,
	},
	unsetBgColor: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
});

const emit = defineEmits({
	'focus-change': (_focused: boolean) => true,
});

const { room, hideClose, hideAddMembers } = toRefs(props);
const { toggleLeftPane } = useAppStore();
const chatStore = inject(ChatStoreKey)!;

let showSettingsOnMembersBack = false;

const friendAddJolticonVersion = ref(1);
const sidebar = ref<SidebarTab | undefined>(
	!Screen.isXs && !room.value.isFiresideRoom && SettingChatGroupShowMembers.get()
		? 'members'
		: undefined
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

const chat = computed(() => chatStore.chat!);
const users = computed(() => chat.value.roomMembers[room.value.id]);
const membersCount = computed(() => formatNumber(room.value.members.length));

const roomTitle = computed(() =>
	room.value.isGroupRoom
		? getChatRoomTitle(room.value, chat.value)
		: room.value.user?.display_name
);

const showMembersViewButton = computed(
	() => room.value.isFiresideRoom || (!room.value.isPmRoom && !Screen.isXs)
);

watchEffect(() => SettingChatGroupShowMembers.set(isShowingUsers.value));

function addGroup() {
	// When creating a group from a PM window,
	// we want to put the room user at the top of the list
	const initialUser = room.value.user;
	const invitableUsers = chat.value.friendsList.collection.filter(
		friend => friend.id !== initialUser?.id
	);

	if (initialUser) {
		invitableUsers.unshift(initialUser);
	}

	// Give the InviteModal the initialUser so it can set them as invited by default
	ChatInviteModal.show(room.value, invitableUsers, initialUser);
}

function addMembers() {
	// Filter out the room members as we don't want to add them again.
	const members = room.value.members.map(member => member.id);
	const invitableUsers = chat.value.friendsList.collection.filter(
		({ id }) => !members.includes(id)
	);
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
	<div :key="room.id" class="chat-window">
		<!-- Window Header -->
		<template v-if="!fullSidebar || !sidebar">
			<AppHeaderBar
				:key="room.id"
				class="-header"
				:automatically-imply-leading="!room.isFiresideRoom"
				:elevation="1"
			>
				<!-- Animation scope. -->
				<template v-if="!room.isFiresideRoom" #leading>
					<span v-if="!room.isPmRoom" class="anim-fade-in-enlarge no-animate-xs">
						<div class="-icon">
							<AppJolticon icon="users" />
						</div>
					</span>
					<router-link
						v-else-if="room.user"
						class="anim-fade-in-enlarge no-animate-xs"
						:to="room.user.url"
					>
						<img class="-icon" :src="room.user.img_avatar" alt="" />
						<AppChatUserOnlineStatus :is-online="room.user.isOnline" :size="16" />
					</router-link>
				</template>

				<template #title>
					<slot name="title">
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
							<div>
								<router-link class="link-unstyled" :to="room.user.url">
									{{ roomTitle }}
								</router-link>
								<AppUserVerifiedTick :user="room.user" />
							</div>
							<small>@{{ room.user.username }}</small>
						</div>
					</slot>
				</template>

				<template #actions>
					<AppButton
						v-if="!hideAddMembers"
						v-app-tooltip="
							room.isPmRoom ? $gettext('Create group chat') : $gettext('Add friends')
						"
						class="-header-control anim-fade-in"
						circle
						trans
						:icon="'friend-add-' + friendAddJolticonVersion"
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
						@click="toggleSidebar('members')"
					/>

					<!-- TODO(fireside-redesign) remove condition later -->
					<AppButton
						v-if="!room.isFiresideRoom"
						v-app-tooltip="$gettext(`Settings`)"
						circle
						sparse
						trans
						icon="ellipsis-h"
						@click="toggleSidebar('settings')"
					/>

					<AppButton
						v-if="!hideClose"
						v-app-tooltip="$gettext('Close')"
						class="-header-control"
						circle
						trans
						icon="remove"
						@click="close"
					/>
				</template>
			</AppHeaderBar>
		</template>
		<template v-else-if="Screen.isDesktop">
			<AppHeaderBar class="-header" :elevation="1">
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
						<template v-if="!room.isFiresideRoom && room.isGroupRoom">
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
						v-if="!room.isFiresideRoom && (!room.isGroupRoom || sidebar === 'members')"
						v-app-tooltip="$gettext('Add friends')"
						class="-header-control"
						circle
						trans
						:icon="'friend-add-' + friendAddJolticonVersion"
						@mouseenter="friendAddJolticonVersion = 2"
						@mouseleave="friendAddJolticonVersion = 1"
						@click="room.isPmRoom ? addGroup() : addMembers()"
					/>
				</template>
			</AppHeaderBar>
		</template>

		<div class="-body">
			<div class="-chatting-section" :class="{ '-hide': !!sidebar }">
				<div class="-output" :class="{ '-overlay': overlay, '-output-bg': !unsetBgColor }">
					<AppChatWindowOutput :key="room.id" class="-output-inner" :room="room" />
				</div>

				<div v-if="chat.currentUser" class="-send-container">
					<AppChatWindowSend :room="room" @focus-change="emit('focus-change', $event)" />
				</div>
			</div>

			<div
				v-if="sidebar"
				class="-sidebar"
				:class="{
					'-full': fullSidebar,
					'-overlay': overlay,
				}"
			>
				<div v-if="Screen.isDesktop && !fullSidebar" class="-sidebar-shadow" />

				<template v-if="Screen.isMobile && sidebar">
					<AppHeaderBar class="-header" :elevation="1">
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
								<template v-if="!room.isFiresideRoom && room.isGroupRoom">
									<AppTranslate>Group Settings</AppTranslate>
								</template>
								<template v-else>
									<AppTranslate>Chat Settings</AppTranslate>
								</template>
							</template>
							<template v-else-if="room.isFiresideRoom">
								<AppTranslate>Members</AppTranslate>
							</template>
							<template v-else>
								<AppTranslate>Group Members</AppTranslate>
							</template>
						</template>

						<template #actions>
							<AppButton
								v-if="
									!room.isFiresideRoom &&
									(!room.isGroupRoom || sidebar === 'members')
								"
								v-app-tooltip="$gettext('Add friends')"
								class="-header-control"
								circle
								trans
								:icon="'friend-add-' + friendAddJolticonVersion"
								@mouseenter="friendAddJolticonVersion = 2"
								@mouseleave="friendAddJolticonVersion = 1"
								@click="room.isPmRoom ? addGroup() : addMembers()"
							/>
						</template>
					</AppHeaderBar>
				</template>

				<div class="-sidebar-container">
					<AppScrollScroller class="-sidebar-scroller">
						<template v-if="sidebar === 'settings'">
							<FormChatRoomSettings
								:room="room"
								:show-members-preview="
									(!showMembersViewButton || Screen.isMobile) && room.isGroupRoom
								"
								:members="users.collection"
								:style="{
									paddingTop: Screen.isXs ? '16px' : undefined,
								}"
								@view-members="sidebar = 'members'"
							/>
						</template>
						<template v-else-if="sidebar === 'members'">
							<div class="nav-heading">
								<AppTranslate>Members</AppTranslate>
								<span class="badge badge-subtle">
									{{ membersCount }}
								</span>
							</div>

							<AppChatMemberList
								v-if="users"
								:users="users.collection"
								:room="room"
							/>
						</template>
					</AppScrollScroller>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.chat-window
	position: relative
	flex: auto
	display: flex
	flex-direction: column
	min-width: 0
	z-index: 1

.-header
	z-index: 3

.-icon
	img-circle()
	display: flex
	align-items: center
	justify-content: center
	width: 40px
	height: 40px
	background-color: var(--theme-backlight)

	::v-deep(.jolticon)
		color: var(--theme-backlight-fg)

.-header-name
	display: inline-flex
	flex-direction: column
	text-overflow()

.-header-control
	position: relative
	vertical-align: top
	margin-left: 4px

.-header-members
	font-family: $font-family-heading
	font-size: $font-size-base
	font-weight: 800
	padding: 24px 16px 16px

.-body
	display: flex
	flex: auto
	position: relative

.-chatting-section
	display: flex
	flex-direction: column
	flex: auto
	min-width: 0
	flex-basis: 480px

.-sidebar-shadow
	position: absolute
	top: 0
	bottom: 0
	left: 0
	width: 8px
	background: linear-gradient(to right, rgba($black, 0.2), transparent)
	z-index: 1

.-sidebar-container
	position: relative
	width: 100%
	height: 100%

.-sidebar
	position: relative
	width: 320px
	flex: 0 1 320px
	change-bg(bg)

	&.-full
		position: absolute
		width: unset
		left: 0
		top: 0
		right: 0
		bottom: 0
		z-index: 2

	&:not(.-full)
		@media $media-mobile
			position: fixed
			z-index: 4
			left: 0
			top: 0
			right: 0
			bottom: 0
			width: unset

.-sidebar-scroller
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-output
	position: relative
	flex: auto
	display: flex
	height: 100%

.-output-bg
	change-bg(bg-offset)

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

.-overlay
	change-bg-rgba(var(--theme-bg-rgb), 0.5)

.-hide
	visibility: hidden
</style>
