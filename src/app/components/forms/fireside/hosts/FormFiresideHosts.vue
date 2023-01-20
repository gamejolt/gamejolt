<script lang="ts">
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import { sleep } from '../../../../../utils/utils';
import {
	inviteFiresideHost,
	removeFiresideHost,
} from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';
import { ChatUser } from '../../../../components/chat/user';
import AppChatList from '../../../../components/chat/_list/AppChatList.vue';
import { FiresideController } from '../../../../components/fireside/controller/controller';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';
import { useChatRoomMembers } from '../../../chat/room-channel';
import AppFiresideHostsItem from './AppFiresideHostsItem.vue';

const ListTitles = {
	currentHosts: $gettext(`Current hosts`),
	friends: $gettext(`Friends`),
	chat: $gettext(`Chat`),
};

export type ListTitle = keyof typeof ListTitles;
</script>

<script lang="ts" setup>
const props = defineProps({
	section: {
		type: String as PropType<ListTitle>,
		required: true,
	},
	controller: {
		type: Object as PropType<FiresideController>,
		required: true,
	},
});

const { section, controller } = toRefs(props);

const processingIds = ref(new Set<number>());

const isMounted = ref(true);

const myUser = computed(() => controller.value.user.value);
const fireside = computed(() => controller.value.fireside);
const chat = computed(() => controller.value.chat.value);

const chatRoom = computed(() => controller.value.chatRoom.value);
const { memberCollection } = useChatRoomMembers(chatRoom);

const canManageCohosts = computed(() => controller.value.canManageCohosts.value);
const hosts = computed(() => controller.value.hosts.value);

const users = computed(() => {
	let list: ChatUser[] = [];

	switch (section.value) {
		case 'currentHosts': {
			return hosts.value.reduce((result, { user }) => {
				if (user && isHost(user) && !_isMe(user)) {
					result.push(user);
				}
				return result;
			}, [] as User[]);
		}

		case 'chat':
			list = memberCollection.value?.users || [];
			break;

		case 'friends':
			list = chat.value?.friendsList.users || [];
			break;
	}

	return list.filter(user => !isHost(user) && !_isMe(user));
});

onMounted(() => {
	isMounted.value = true;
});

onUnmounted(() => {
	isMounted.value = false;
});

function _isMe(user: User | ChatUser) {
	return user.id === myUser.value?.id;
}

function isUserProcessing(user: ChatUser | User) {
	return processingIds.value.has(user.id);
}

function isHost(user: ChatUser | User) {
	return hosts.value.some(i => i.user.id === user.id);
}

async function processUser(user: ChatUser | User) {
	if (isUserProcessing(user)) {
		return;
	}

	processingIds.value.add(user.id);

	try {
		const wasHost = isHost(user);
		if (wasHost) {
			await removeFiresideHost(fireside.value, user.id);
		} else {
			await inviteFiresideHost(fireside.value, user.id);
		}

		// We will get a grid message that will update the RTC host list.
		while (wasHost === isHost(user)) {
			if (!isMounted.value) {
				break;
			}
			await sleep(250);
		}
	} finally {
		processingIds.value.delete(user.id);
	}
}
</script>

<template>
	<AppChatList :entries="users" :hide-filter="section === 'currentHosts'">
		<template #default="{ item }: { item: ChatUser }">
			<AppFiresideHostsItem
				:user="item"
				:disable-toggle="!canManageCohosts"
				:is-processing="isUserProcessing(item)"
				:is-host="isHost(item)"
				@click="processUser(item)"
			/>
		</template>

		<template #empty>
			<AppIllustration :asset="illNoCommentsSmall">
				<p v-if="section === 'currentHosts'">
					{{ $gettext(`We couldn't find any hosts.`) }}
				</p>
				<p v-else-if="section === 'friends'">
					{{ $gettext(`We couldn't find any friends you can add as hosts.`) }}
				</p>
				<p v-else-if="section === 'chat'">
					{{ $gettext(`We couldn't find anyone in chat.`) }}
				</p>
			</AppIllustration>
		</template>
	</AppChatList>
</template>
