<script lang="ts" setup>
import { computed, ref } from 'vue';
import { stringSort } from '../../../../utils/array';
import { sleep } from '../../../../utils/utils';
import {
inviteFiresideHost,
removeFiresideHost
} from '../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import AppTabBar from '../../../../_common/tab-bar/AppTabBar.vue';
import AppTabBarItem from '../../../../_common/tab-bar/AppTabBarItem.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import { useChatRoomMembers } from '../../../components/chat/room-channel';
import { ChatUser } from '../../../components/chat/user';
import AppChatList from '../../../components/chat/_list/AppChatList.vue';
import { useFiresideController } from '../../../components/fireside/controller/controller';
import { illNoCommentsSmall } from '../../../img/ill/illustrations';
import AppFiresideSidebar from './AppFiresideSidebar.vue';
import AppFiresideSidebarHeading from './AppFiresideSidebarHeading.vue';
import AppFiresideSidebarHostsItem from './AppFiresideSidebarHostsItem.vue';

const ListTitles = {
	friends: $gettext(`Friends`),
	chat: $gettext(`Chat`),
};

type ListTitle = keyof typeof ListTitles;

const { user, fireside, rtc, chat, chatRoom, chatChannel } = useFiresideController()!;
const memberCollection = useChatRoomMembers(chatChannel.value!);

const usersProcessing = ref<(ChatUser | User)[]>([]);
const isOpen = ref(true);
const activeList = ref<ListTitle>('friends');

const users = computed(() => {
	switch (activeList.value) {
		case 'chat':
			return memberCollection.users || [];

		case 'friends':
			return chat.value?.friendsList.users || [];

		default:
			return [];
	}
});

const hostableUsers = computed(() => {
	if (!rtc.value) {
		return [];
	}

	const currentHosts = rtc.value.hosts;
	return users.value
		.filter(i => !currentHosts.some(host => host.user.id === i.id))
		.sort((a, b) => stringSort(a.display_name, b.display_name));
});

const currentCohosts = computed(() => {
	const hosts = rtc.value?.hosts || [];
	const listableHostIds = rtc.value?.listableHostIds;
	const myUserId = user.value?.id;

	return hosts
		.filter(host =>
			host.user.id === myUserId
				? false
				: !host.needsPermissionToView || listableHostIds?.has(host.user.id)
		)
		.map(i => i.user)
		.sort((a, b) => stringSort(a.display_name, b.display_name));
});

const manageableUsers = computed(() => [...currentCohosts.value, ...hostableUsers.value]);

function isUserProcessing(user: ChatUser | User) {
	return usersProcessing.value.some(i => i.id === user.id);
}

function isHost(user: ChatUser | User) {
	return user instanceof User;
}

async function processUser(user: ChatUser | User) {
	if (usersProcessing.value.includes(user)) {
		return;
	}

	usersProcessing.value.push(user);

	try {
		const wasHost = isHost(user);
		if (wasHost) {
			await removeFiresideHost(fireside, user.id);
		} else {
			await inviteFiresideHost(fireside, user.id);
		}

		// We will get a grid message that will update the RTC host list.
		while (
			(wasHost && currentCohosts.value.includes(user as User)) ||
			(!wasHost && hostableUsers.value.includes(user as ChatUser))
		) {
			if (!isOpen.value) {
				break;
			}
			await sleep(250);
		}
	} finally {
		const index = usersProcessing.value.indexOf(user);
		if (index !== -1) {
			usersProcessing.value.splice(index, 1);
		}
	}
}
</script>

<template>
	<AppFiresideSidebar>
		<template #header>
			<AppFiresideSidebarHeading>
				<AppTranslate>Manage Hosts</AppTranslate>
			</AppFiresideSidebarHeading>

			<AppTabBar>
				<AppTabBarItem
					v-for="(title, key) of ListTitles"
					:key="key"
					:active="activeList === key"
					@click="activeList = key"
				>
					{{ title }}
				</AppTabBarItem>
			</AppTabBar>
		</template>

		<template #body>
			<AppChatList v-if="chatRoom" :entries="manageableUsers">
				<template #default="{ item }: { item: ChatUser }">
					<AppFiresideSidebarHostsItem
						:user="item"
						:is-processing="isUserProcessing(item)"
						:is-host="isHost(item)"
						@click="processUser(item)"
					/>
				</template>

				<template #empty>
					<AppIllustration :asset="illNoCommentsSmall">
						<p>
							<AppTranslate>There are no people here.</AppTranslate>
						</p>
					</AppIllustration>
				</template>
			</AppChatList>
		</template>
	</AppFiresideSidebar>
</template>
