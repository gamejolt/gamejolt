<script lang="ts">
import { computed, onMounted, onUnmounted, PropType, ref, toRefs } from 'vue';
import { arrayRemove } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { storeModelList } from '../../../../../_common/model/model-store.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext, $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';
import { illNoCommentsSmall } from '../../../../../_common/illustration/illustrations';
import { tryGetRoomRole } from '../../../chat/client';
import { ChatRole } from '../../../chat/role';
import { ChatRoom } from '../../../chat/room';
import { useChatRoomMembers } from '../../../chat/room-channel';
import { ChatUser } from '../../../chat/user';
import AppChatList from '../../../chat/_list/AppChatList.vue';
import { useGridStore } from '../../../grid/grid-store';
import AppFiresideChatModsItem from './AppFiresideChatModsItem.vue';

export type ChatModSection = 'currentMods' | 'friends' | 'chat';
</script>

<script lang="ts" setup>
const MODS_PER_PAGE = 24;

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });

const props = defineProps({
	section: {
		type: String as PropType<ChatModSection>,
		required: true,
	},
	chatRoom: {
		type: Object as PropType<ChatRoom>,
		default: undefined,
	},
	getCurrentMods: {
		type: Boolean,
	},
	initialMods: {
		type: Array as PropType<ChatUser[]>,
		default: undefined,
	},
	hideEmpty: {
		type: Boolean,
	},
});

const { section, chatRoom, getCurrentMods, initialMods, hideEmpty } = toRefs(props);

const emit = defineEmits({
	listLoaded: (_users: ChatUser[]) => true,
	listChanged: (_users: ChatUser[]) => true,
});

const { chat } = useGridStore();
const { user: myUser } = useCommonStore();

const safeChatRoom = computed(() => chatRoom?.value);
const { memberCollection } = useChatRoomMembers(safeChatRoom);

const isMounted = ref(true);
const isLoading = ref(false);
const hasError = ref(false);

const processingIds = ref(new Set<number>());

const chatMods = ref<ChatUser[]>(initialMods?.value ? [...initialMods.value] : []);
const page = ref(1);
const reachedEnd = ref(false);

const users = computed(() => {
	let list: ChatUser[] = [];

	switch (section.value) {
		case 'currentMods': {
			return chatMods.value.reduce((result, user) => {
				if (user && !_isMe(user) && !user.isStaff) {
					result.push(user);
				}
				return result;
			}, [] as ChatUser[]);
		}

		case 'chat':
			list = memberCollection.value?.users || [];
			break;

		case 'friends':
			list = chat.value?.friendsList.users || [];
			break;
	}

	return list.filter(user => !isModerator(user) && !_isMe(user) && !user.isStaff);
});

onMounted(() => {
	isMounted.value = true;

	fetchChatMods(1, true);
});

onUnmounted(() => {
	isMounted.value = false;
});

function _isMe(user: User | ChatUser) {
	return user.id === myUser.value?.id;
}

async function fetchChatMods(pos: number, assignAll = false) {
	if (!getCurrentMods.value || isLoading.value || hasError.value || !myUser.value) {
		return;
	}

	isLoading.value = true;

	try {
		const response = await Api.sendFieldsRequest(
			`/mobile/chat/${myUser.value.id}`,
			{
				moderators: {
					perPage: MODS_PER_PAGE,
					pos,
				},
			},
			{ detach: true }
		);
		page.value = pos;

		if (!response.moderators || response.moderators.length < MODS_PER_PAGE) {
			reachedEnd.value = true;
		}

		const newModerators = storeModelList(ChatUser, response.moderators);
		if (assignAll) {
			chatMods.value = newModerators;
		} else {
			chatMods.value.push(...newModerators);
		}
	} catch (e) {
		console.error(e);
		hasError.value = true;
	} finally {
		isLoading.value = false;
		emit('listLoaded', chatMods.value);
	}
}

function isUserProcessing(user: ChatUser) {
	return processingIds.value.has(user.id);
}

function isModerator(user: User | ChatUser) {
	if (!chat.value) {
		return false;
	}

	if (user instanceof User) {
		return user.isMod;
	}

	if (user.isStaff) {
		return true;
	}

	if (chatRoom?.value) {
		return tryGetRoomRole(chatRoom.value, user) !== 'user';
	}

	return chatMods.value.some(i => i.id === user.id);
}

function canToggleModerator(user: ChatUser) {
	// Can't demote staff members or modify owner.
	if (user.isStaff || chatRoom?.value?.owner_id === user.id) {
		return false;
	}

	return true;
}

async function toggleModerator(user: ChatUser) {
	if (!canToggleModerator(user) || isUserProcessing(user)) {
		return;
	}

	const isPromoting = !isModerator(user);
	let canProceed: boolean | undefined;

	if (isPromoting) {
		canProceed = await ModalConfirm.show(
			$gettextInterpolate(
				`Do you want to promote @%{ username } to a chat moderator? They will be able to remove messages and kick users from the chat. You can demote them at any time.`,
				{ username: user.username }
			)
		);
	} else {
		canProceed = await ModalConfirm.show(
			$gettextInterpolate(`Do you want to demote @%{ username } to a normal chat user?`, {
				username: user.username,
			})
		);
	}

	if (!canProceed) {
		return;
	}

	processingIds.value.add(user.id);

	let apiSuffix = `${user.id}`;
	if (chatRoom?.value) {
		apiSuffix = `${chatRoom.value.id}/${apiSuffix}`;
	}

	try {
		let payload: any = {};

		if (isPromoting) {
			payload = await Api.sendRequest(
				`/web/dash/fireside/chat/promote-moderator/${apiSuffix}`,
				{},
				{ detach: true }
			);

			if (!payload.success) {
				throw new Error('Request failed');
			}

			if (payload.role) {
				showSuccessGrowl(
					$gettextInterpolate(`@%{ username } has been promoted to a chat moderator.`, {
						username: user.username,
					})
				);
			}
		} else {
			payload = await Api.sendRequest(
				`/web/dash/fireside/chat/demote-moderator/${apiSuffix}`,
				{},
				{ detach: true }
			);

			if (!payload.success) {
				throw new Error('Request failed');
			}

			if (payload.role) {
				showSuccessGrowl(
					$gettextInterpolate(`@%{ username } has been demoted to a normal chat user.`, {
						username: user.username,
					})
				);
			}
		}

		if (payload.role) {
			user.role = new ChatRole(payload.role).role;
			chatRoom?.value?.updateRoleForUser(user);
		}

		if (isPromoting) {
			chatMods.value.unshift(user);
		} else {
			arrayRemove(chatMods.value, i => i.id === user.id);
		}
		emit('listChanged', chatMods.value);
	} catch (e) {
		showErrorGrowl($gettext(`Something went wrong.`));
		console.error(e);
	} finally {
		processingIds.value.delete(user.id);
	}
}
</script>

<template>
	<AppLoadingFade :is-loading="section === 'currentMods' && isLoading && !chatMods.length">
		<AppChatList :entries="users" :hide-filter="section === 'currentMods'">
			<template #default="{ item }">
				<AppFiresideChatModsItem
					:user="item"
					:is-processing="isUserProcessing(item)"
					:is-moderator="section === 'currentMods'"
					:disable-toggle="item.isStaff"
					@click="toggleModerator(item)"
				/>
			</template>

			<template #scroll-end>
				<template v-if="getCurrentMods">
					<AppScrollInview
						v-if="section === 'currentMods' && !reachedEnd && !isLoading"
						:config="InviewConfig"
						@inview="fetchChatMods(page + 1)"
					/>
					<AppLoading v-else-if="section === 'currentMods' && isLoading" centered />
				</template>
			</template>

			<template v-if="!hideEmpty" #empty>
				<AppIllustration :asset="illNoCommentsSmall">
					<p v-if="section === 'currentMods'">
						{{ $gettext(`We couldn't find any moderators.`) }}
					</p>
					<p v-else-if="section === 'friends'">
						{{ $gettext(`We couldn't find any friends you can add as moderators.`) }}
					</p>
					<p v-else-if="section === 'chat'">
						{{ $gettext(`We couldn't find anyone in chat.`) }}
					</p>
				</AppIllustration>
			</template>
		</AppChatList>
	</AppLoadingFade>
</template>
