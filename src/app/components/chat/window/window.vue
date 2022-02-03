<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { SettingChatGroupShowMembers } from '../../../../_common/settings/settings.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import { useAppStore } from '../../../store/index';
import { ChatStore, ChatStoreKey } from '../chat-store';
import { leaveChatRoom } from '../client';
import { ChatInviteModal } from '../invite-modal/invite-modal.service';
import AppChatMemberList from '../member-list/AppChatMemberList.vue';
import { ChatMessage } from '../message';
import { ChatRoom, getChatRoomTitle } from '../room';
import AppChatUserOnlineStatus from '../user-online-status/user-online-status.vue';
import AppChatWindowMenu from './menu/menu.vue';
import AppChatWindowOutput from './output/output.vue';
import AppChatWindowSend from './send/send.vue';

@Options({
	components: {
		AppScrollScroller,
		AppChatUserOnlineStatus,
		AppChatWindowSend,
		AppChatWindowOutput,
		AppFadeCollapse,
		AppChatWindowMenu,
		AppChatMemberList,
		AppUserVerifiedTick,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppChatWindow extends Vue {
	@Prop({ type: Object, required: true }) room!: ChatRoom;
	@Prop({ type: Array, required: true }) messages!: ChatMessage[];
	@Prop({ type: Array, required: true }) queuedMessages!: ChatMessage[];

	store = setup(() => useAppStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	isShowingUsers = Screen.isXs ? false : SettingChatGroupShowMembers.get();
	isDescriptionCollapsed = false;
	friendAddJolticonVersion = 1;

	readonly Screen = Screen;

	@Emit('focus-change')
	emitFocusChange(_focused: boolean) {}

	get chat() {
		return this.chatStore.chat!;
	}

	get users() {
		return this.chat.roomMembers[this.room.id];
	}

	get roomTitle() {
		return this.room.isGroupRoom
			? getChatRoomTitle(this.room, this.chat)
			: this.room.user?.display_name;
	}

	get membersCount() {
		return formatNumber(this.room.members.length);
	}

	addGroup() {
		// When creating a group from a PM window,
		// we want to put the room user at the top of the list
		const initialUser = this.room.user;
		const invitableUsers = this.chat.friendsList.collection.filter(
			friend => friend.id !== initialUser?.id
		);

		if (initialUser) {
			invitableUsers.unshift(initialUser);
		}

		// Give the InviteModal the initialUser so it can set them as invited by default
		ChatInviteModal.show(this.room, invitableUsers, initialUser);
	}

	addMembers() {
		// Filter out the room members as we don't want to add them again.
		const members = this.room.members.map(member => member.id);
		const invitableUsers = this.chat.friendsList.collection.filter(
			({ id }) => !members.includes(id)
		);
		ChatInviteModal.show(this.room, invitableUsers);
	}

	close() {
		// xs size needs to show the friends list when closing the room.
		// any other size can close the whole chat instead
		if (Screen.isXs) {
			leaveChatRoom(this.chat);
		} else {
			this.store.toggleLeftPane();
		}
	}

	toggleUsers() {
		this.isShowingUsers = !this.isShowingUsers;

		if (!Screen.isXs) {
			SettingChatGroupShowMembers.set(this.isShowingUsers);
		}
	}
}
</script>

<template>
	<div class="chat-window-wrap">
		<div class="-chat-window-offset-left" />
		<!-- We sadly need the chat close thing twice. It takes up the empty
		background space so you can click that to close chat. -->
		<div class="chat-window-back-close" @click="close" />
		<div class="chat-window">
			<div class="chat-window-back-close" @click="close" />

			<div class="chat-window-main">
				<!-- Window Header -->
				<div class="chat-window-header-wrap">
					<div class="chat-window-header fill-offset">
						<div class="chat-window-header-controls">
							<AppChatWindowMenu :room="room" />

							<span
								@mouseenter="friendAddJolticonVersion = 2"
								@mouseleave="friendAddJolticonVersion = 1"
							>
								<AppButton
									v-app-tooltip="
										room.isPmRoom
											? $gettext('Create Group Chat')
											: $gettext('Add Friends')
									"
									class="-header-control anim-fade-in"
									circle
									trans
									:icon="'friend-add-' + friendAddJolticonVersion"
									@click="room.isPmRoom ? addGroup() : addMembers()"
								/>
							</span>

							<AppButton
								v-if="!room.isPmRoom"
								v-app-tooltip="
									isShowingUsers
										? $gettext('Hide Members')
										: $gettext('Show Members')
								"
								circle
								trans
								icon="users"
								class="-header-control anim-fade-in"
								@click="toggleUsers"
							/>

							<AppButton
								v-app-tooltip="$gettext('Close Room')"
								class="-header-control"
								circle
								trans
								icon="remove"
								@click="close"
							/>
						</div>

						<!-- Animation scope. -->
						<div :key="room.id" class="chat-window-header-content">
							<span
								v-if="!room.isPmRoom"
								class="chat-window-header-avatar avatar anim-fade-in-enlarge no-animate-xs"
							>
								<div class="-icon">
									<AppJolticon icon="users" />
								</div>
							</span>
							<router-link
								v-else-if="room.user"
								class="chat-window-header-avatar avatar anim-fade-in-enlarge no-animate-xs"
								:to="room.user.url"
							>
								<img class="-icon" :src="room.user.img_avatar" alt="" />
								<AppChatUserOnlineStatus
									:is-online="room.user.isOnline"
									:size="16"
								/>
							</router-link>

							<h3 v-if="!room.isPmRoom" class="anim-fade-in-right no-animate-xs">
								{{ roomTitle }}
							</h3>
							<h3
								v-else-if="room.user"
								class="anim-fade-in-right no-animate-xs"
								:title="`${room.user.display_name} (@${room.user.username})`"
							>
								<router-link class="link-unstyled" :to="room.user.url">
									{{ roomTitle }}
								</router-link>
								<AppUserVerifiedTick :user="room.user" />
								<br />
								<small>@{{ room.user.username }}</small>
							</h3>
						</div>
					</div>
				</div>

				<div class="chat-window-output fill-backdrop">
					<AppChatWindowOutput
						:key="room.id"
						class="chat-window-output-inner"
						:room="room"
						:messages="messages"
						:queued-messages="queuedMessages"
					/>
				</div>

				<div v-if="chat.currentUser" class="chat-window-send-container">
					<AppChatWindowSend :room="room" @focus-change="emitFocusChange" />
				</div>
			</div>
		</div>
		<div
			class="-chat-window-offset-right"
			:class="{ '-has-content': !room.isPmRoom && isShowingUsers }"
		>
			<!-- Room Users -->
			<div v-if="!room.isPmRoom && isShowingUsers" class="chat-window-users">
				<div v-if="!Screen.isXs" class="chat-window-users-shadow" />

				<AppScrollScroller class="chat-window-users-scroller">
					<template v-if="Screen.isXs">
						<br />
						<div class="nav-controls">
							<AppButton block icon="chevron-left" @click="toggleUsers">
								<AppTranslate>Back to Chat</AppTranslate>
							</AppButton>
						</div>
					</template>

					<div class="nav-heading">
						<AppTranslate>Members</AppTranslate>
						<span class="badge badge-subtle">
							{{ membersCount }}
						</span>
					</div>

					<AppChatMemberList v-if="users" :users="users.collection" :room="room" />
				</AppScrollScroller>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./window.styl" scoped></style>
