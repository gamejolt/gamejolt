<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { closeChatRoom, openChatRoom } from '~app/components/chat/client';
import { sortByLastMessageOn } from '~app/components/chat/user-collection';
import AppChatUserList from '~app/components/chat/user-list/AppChatUserList.vue';
import { useGridStore } from '~app/components/grid/grid-store';
import AppButton from '~common/button/AppButton.vue';
import { formatNumber } from '~common/filters/number';
import AppIllustration from '~common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '~common/illustration/illustrations';
import { showInviteModal } from '~common/invite/modal/modal.service';
import { Screen } from '~common/screen/screen-service';
import { useCommonStore } from '~common/store/common-store';
import AppTabBar from '~common/tab-bar/AppTabBar.vue';
import AppTabBarItem from '~common/tab-bar/AppTabBarItem.vue';
import { $gettext } from '~common/translate/translate.service';

const { user } = useCommonStore();
const { chatUnsafe: chat } = useGridStore();

const tab = ref<'chats' | 'friends'>('chats');

const friends = computed(() => chat.value.friendsList.users);
const groups = computed(() => chat.value.groupRooms);
const chats = computed(() => sortByLastMessageOn([...groups.value, ...friends.value]));
const friendsCount = computed(() => chat.value.friendsList.count);
const isEmpty = computed(
	() => chats.value.length === 0 || (tab.value === 'friends' && !friends.value.length)
);

onMounted(() => {
	const sessionRoomId = chat.value.getSessionRoomId();

	// xs size needs to show the friends list instead of opening the last chat
	// room.
	if (sessionRoomId && !Screen.isXs) {
		openChatRoom(chat.value, sessionRoomId);
	}
});

onUnmounted(() => closeChatRoom(chat.value));

function openInviteModal() {
	showInviteModal({ user: user.value! });
}
</script>

<template>
	<template v-if="isEmpty">
		<AppIllustration :asset="illNoCommentsSmall">
			<p>
				{{ $gettext(`No friends yet.`) }}
			</p>

			<AppButton primary solid @click="openInviteModal()">
				{{ $gettext(`Invite a friend`) }}
			</AppButton>
		</AppIllustration>
	</template>
	<template v-else>
		<AppTabBar :style="{ padding: `0 16px` }">
			<AppTabBarItem v-if="chats.length > 0" :active="tab === 'chats'" @click="tab = 'chats'">
				{{ $gettext(`Chats`) }}
			</AppTabBarItem>
			<AppTabBarItem
				:active="chats.length === 0 || tab === 'friends'"
				@click="tab = 'friends'"
			>
				{{ $gettext(`Friends`) }}
				<span class="badge badge-subtle">
					{{ formatNumber(friendsCount) }}
				</span>
			</AppTabBarItem>
		</AppTabBar>

		<AppChatUserList :entries="tab === 'chats' ? chats : friends" />

		<div :style="{ padding: `4px 16px` }">
			<AppButton block primary solid @click="openInviteModal()">
				{{ $gettext(`Invite a friend`) }}
			</AppButton>
		</div>
	</template>
</template>
