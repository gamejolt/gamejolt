<script lang="ts" setup>
import { PropType, toRef, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppButtonGroup from '../../../../_common/button/AppButtonGroup.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppUserFollowButton from '../../../../_common/user/follow/AppUserFollowButton.vue';
import { openChatRoom } from '../../../components/chat/client';
import { useGridStore } from '../../../components/grid/grid-store';
import { useAppStore } from '../../../store';
import { useProfileRouteStore } from '../RouteProfile.vue';
import { showProfileAboutModal } from '../about/modal.service';
import { ProfileQuickLink } from './shortcut/AppProfileShortcuts.vue';

const props = defineProps({
	collapse: {
		type: Boolean,
	},
	quickLinks: {
		type: Array as PropType<ProfileQuickLink[]>,
		default: undefined,
	},
});

const { quickLinks } = toRefs(props);

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
		myUser.value &&
		routeUser.value &&
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
	showProfileAboutModal({ routeStore, quickLinks: quickLinks?.value || [] });
}
</script>

<template>
	<template v-if="routeUser">
		<AppButtonGroup :row="collapse">
			<AppUserFollowButton
				v-if="shouldShowFollow"
				:user="routeUser"
				:hide-count="collapse"
				:icon="collapse && routeUser.is_following ? 'check' : undefined"
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

			<template v-if="collapse">
				<AppButton block @click="showAboutModal()">
					{{ $gettext(`About`) }}
				</AppButton>
			</template>
		</AppButtonGroup>

		<template v-if="!collapse">
			<AppButton v-if="canAddAsFriend" block @click="sendFriendRequest()">
				{{ $gettext(`Send friend request`) }}
			</AppButton>
			<AppButton v-else-if="canMessage" block icon="user-messages" @click="openMessaging">
				{{ $gettext(`Message`) }}
			</AppButton>
		</template>
	</template>
</template>
