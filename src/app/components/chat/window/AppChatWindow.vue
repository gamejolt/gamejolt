<script lang="ts">
import { computed, inject, PropType, ref, toRefs, watch } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppMobileAppBar from '../../../../_common/mobile-app/AppMobileAppBar.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { SettingChatGroupShowMembers } from '../../../../_common/settings/settings.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import { useAppStore } from '../../../store/index';
import { ChatStoreKey } from '../chat-store';
import { leaveChatRoom } from '../client';
import FormChatEditRoom from '../FormChatEditRoom.vue';
import { ChatInviteModal } from '../invite-modal/invite-modal.service';
import AppChatMemberList from '../member-list/AppChatMemberList.vue';
import { ChatRoom, getChatRoomTitle } from '../room';
import { sortCollection } from '../user-collection';
import AppChatUserOnlineStatus from '../user-online-status/user-online-status.vue';
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
});

const emit = defineEmits({
	'focus-change': (_focused: boolean) => true,
});

const { room } = toRefs(props);
const { toggleLeftPane } = useAppStore();
const chatStore = inject(ChatStoreKey)!;

let showSettingsOnMembersBack = false;

const friendAddJolticonVersion = ref(1);
const sidebar = ref<SidebarTab | undefined>(
	!Screen.isXs && SettingChatGroupShowMembers.get() ? 'members' : undefined
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
const users = computed(() => {
	const members = room.value.members.concat();
	sortCollection(chat.value, members, 'role');
	return members;
});
const membersCount = computed(() => formatNumber(room.value.members.length));

const roomTitle = computed(() =>
	room.value.isGroupRoom
		? getChatRoomTitle(room.value, chat.value)
		: room.value.user?.display_name
);

const showMembersViewButton = computed(() => !room.value.isPmRoom && !Screen.isXs);

watch(isShowingUsers, () => SettingChatGroupShowMembers.set(isShowingUsers.value));

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
	<div class="chat-window">
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close chat. -->
		<div class="-close" @click="close" />
		<div class="-window">
			<div class="-close" @click="close" />

			<div :key="room.id" class="-window-main">
				<!-- Window Header -->
				<div class="-header">
					<!-- Animation scope. -->
					<div :key="room.id" class="-header-content">
						<span
							v-if="!room.isPmRoom"
							class="-header-avatar anim-fade-in-enlarge no-animate-xs"
						>
							<div class="-icon">
								<AppJolticon icon="users" />
							</div>
						</span>
						<router-link
							v-else-if="room.user"
							class="-header-avatar anim-fade-in-enlarge no-animate-xs"
							:to="room.user.url"
						>
							<img class="-icon" :src="room.user.img_avatar" alt="" />
							<AppChatUserOnlineStatus :is-online="room.user.isOnline" :size="16" />
						</router-link>

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
							<router-link class="link-unstyled" :to="room.user.url">
								{{ roomTitle }}
							</router-link>
							<AppUserVerifiedTick :user="room.user" />
							<br />
							<small>@{{ room.user.username }}</small>
						</div>
					</div>

					<div class="-header-controls">
						<AppButton
							v-app-tooltip="
								room.isPmRoom
									? $gettext('Create group chat')
									: $gettext('Add friends')
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

						<AppButton
							v-app-tooltip="$gettext(`Settings`)"
							circle
							sparse
							trans
							icon="ellipsis-h"
							@click="toggleSidebar('settings')"
						/>

						<AppButton
							v-app-tooltip="$gettext('Close')"
							class="-header-control"
							circle
							trans
							icon="remove"
							@click="close"
						/>
					</div>
				</div>

				<div class="-body">
					<div class="-chatting-section">
						<div class="-output">
							<AppChatWindowOutput
								:key="room.id"
								class="-output-inner"
								:room="room"
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

						<AppScrollScroller class="-sidebar-scroller">
							<AppMobileAppBar v-if="Screen.isMobile">
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
										:icon="'friend-add-' + friendAddJolticonVersion"
										@mouseenter="friendAddJolticonVersion = 2"
										@mouseleave="friendAddJolticonVersion = 1"
										@click="room.isPmRoom ? addGroup() : addMembers()"
									/>
								</template>
							</AppMobileAppBar>

							<template v-if="sidebar === 'settings'">
								<FormChatEditRoom
									:room="room"
									:show-members-preview="
										!showMembersViewButton && room.isGroupRoom
									"
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

								<AppChatMemberList v-if="users" :users="users" :room="room" />
							</template>
						</AppScrollScroller>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
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
	z-index: 0

.-window
	change-bg(bg)
	position: relative
	display: flex
	flex: auto
	justify-content: center
	width: 100%
	height: 100%
	z-index: 1
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
	z-index: 1

.-header
	position: relative
	flex: none
	width: 100%
	padding: 12px 16px
	display: flex
	align-items: center
	box-shadow: 0px 1px 8px 4px rgba(0, 0, 0, 0.25)
	z-index: 2

.-header-content
	display: flex
	align-items: center
	margin-right: auto
	min-width: 0

.-header-avatar
	margin-right: 16px

	.-icon
		img-circle()
		display: flex
		align-items: center
		justify-content: center
		width: 40px
		height: 40px
		background-color: var(--theme-backlight)

		.jolticon
			color: var(--theme-backlight-fg)

.-header-name
	text-overflow()

.-header-controls
	flex: none

.-header-control
	position: relative
	vertical-align: top
	margin-left: 4px

.-body
	display: flex
	flex: auto

.-chatting-section
	display: flex
	flex-direction: column
	flex: auto

.-sidebar
	position: relative
	width: 320px
	flex: none

	@media $media-mobile
		position: fixed
		z-index: 2
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
	z-index: 1

.-output
	position: relative
	flex: auto
	display: flex
	height: 100%

.-sidebar-scroller
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-output-inner
	// Allows the scroll bar some breathing room
	margin-right: 4px

.-send-container
	width: 100%
	flex: none
</style>
