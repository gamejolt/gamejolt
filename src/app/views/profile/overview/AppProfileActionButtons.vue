<script lang="ts" setup>
import { toRef } from 'vue';

import { openChatRoom } from '~app/components/chat/client';
import { useGridStore } from '~app/components/grid/grid-store';
import { useAppStore } from '~app/store';
import { showProfileAboutModal } from '~app/views/profile/about/modal.service';
import AppProfileShortcutExtras from '~app/views/profile/overview/shortcut/AppProfileShortcutExtras.vue';
import { ProfileQuickLink } from '~app/views/profile/overview/shortcut/AppProfileShortcuts.vue';
import { useProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import AppAdTakeoverFloat from '~common/ad/AppAdTakeoverFloat.vue';
import AppButton from '~common/button/AppButton.vue';
import AppButtonGroup from '~common/button/AppButtonGroup.vue';
import { Screen } from '~common/screen/screen-service';
import AppUserFollowButton from '~common/user/follow/AppUserFollowButton.vue';

type Props = {
	collapse?: boolean;
	quickLinks?: ProfileQuickLink[];
};
const { collapse = false, quickLinks } = defineProps<Props>();

const routeStore = useProfileRouteStore()!;
const { user: routeUser, myUser, isMe, sendFriendRequest, userFriendship, isFriend } = routeStore;

const { chat } = useGridStore();
const { toggleLeftPane } = useAppStore();

const shouldShowFollow = toRef(
	() =>
		!!routeUser.value &&
		!routeUser.value.is_blocked &&
		!routeUser.value.blocked_you &&
		!isMe.value
);

const canAddAsFriend = toRef(
	() =>
		!!myUser.value &&
		!!routeUser.value &&
		!isMe.value &&
		!userFriendship.value &&
		routeUser.value.friend_requests_enabled &&
		!routeUser.value.is_blocked &&
		!routeUser.value.blocked_you
);

const canMessage = toRef(() => isFriend.value && chat.value && chat.value.connected);

function openMessaging() {
	if (routeUser.value && chat.value) {
		const chatUser = chat.value.friendsList.get(routeUser.value.id);
		if (chatUser) {
			if (Screen.isXs) {
				toggleLeftPane('chat');
			}
			openChatRoom(chat.value, chatUser.room_id);
		}
	}
}

function showAboutModal() {
	showProfileAboutModal({ routeStore, quickLinks: quickLinks || [] });
}
</script>

<template>
	<AppAdTakeoverFloat>
		<AppButtonGroup v-if="routeUser" :row="collapse">
			<div class="flex w-full flex-auto gap-x-[4px]">
				<AppUserFollowButton
					v-if="shouldShowFollow"
					:user="routeUser"
					:icon="routeUser.is_following ? 'check' : undefined"
					hide-count
					block
					location="profilePage"
				/>
				<AppButton
					v-else-if="isMe"
					primary
					block
					:to="{
						name: 'dash.account.edit',
					}"
				>
					{{ $gettext(`Edit profile`) }}
				</AppButton>

				<AppProfileShortcutExtras v-if="!collapse" class="flex-none" />
			</div>

			<div class="flex w-full flex-auto gap-x-[4px]">
				<template v-if="collapse">
					<AppButton block @click="showAboutModal()">
						{{ $gettext(`About`) }}
					</AppButton>
				</template>
				<template v-else>
					<AppButton v-if="canAddAsFriend" block @click="sendFriendRequest()">
						{{ $gettext(`Send friend request`) }}
					</AppButton>
					<AppButton
						v-else-if="canMessage"
						block
						icon="user-messages"
						@click="openMessaging"
					>
						{{ $gettext(`Message`) }}
					</AppButton>
				</template>
			</div>

			<AppProfileShortcutExtras v-if="collapse" class="flex-none" />
		</AppButtonGroup>
	</AppAdTakeoverFloat>
</template>
