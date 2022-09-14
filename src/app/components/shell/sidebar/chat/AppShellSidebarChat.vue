<script lang="ts" setup>
import { onMounted, ref } from '@vue/runtime-core';
import { computed, onUnmounted } from 'vue';
import { EscapeStack } from '../../../../../_common/escape-stack/escape-stack.service';
import { formatNumber } from '../../../../../_common/filters/number';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppTabBar from '../../../../../_common/tab-bar/AppTabBar.vue';
import AppTabBarItem from '../../../../../_common/tab-bar/AppTabBarItem.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { illMaintenance, illNoCommentsSmall } from '../../../../img/ill/illustrations';
import { useAppStore } from '../../../../store';
import { enterChatRoom, leaveChatRoom } from '../../../chat/client';
import { sortByLastMessageOn } from '../../../chat/user-collection';
import AppChatUserList from '../../../chat/user-list/AppChatUserList.vue';
import { useGridStore } from '../../../grid/grid-store';

const store = useAppStore();
const { chatUnsafe: chat } = useGridStore();

let escapeCallback: (() => void) | null = null;

const tab = ref<'chats' | 'friends'>('chats');

const visibleLeftPane = computed(() => store.visibleLeftPane.value);
const friends = computed(() => chat.value.friendsList.collection);
const groups = computed(() => chat.value.groupRooms);
const chats = computed(() => sortByLastMessageOn([...groups.value, ...friends.value]));
const friendsCount = computed(() => chat.value.friendsList.collection.length);

onMounted(() => {
	// xs size needs to show the friends list
	if (chat.value.sessionRoomId && !Screen.isXs) {
		enterChatRoom(chat.value, chat.value.sessionRoomId);
	}

	escapeCallback = () => hideChatPane();
	EscapeStack.register(escapeCallback);
});

onUnmounted(() => {
	if (escapeCallback) {
		EscapeStack.deregister(escapeCallback);
		escapeCallback = null;
	}

	leaveChatRoom(chat.value);
});

function hideChatPane() {
	if (visibleLeftPane.value === 'chat') {
		store.toggleLeftPane('chat');
	}
}
</script>

<template>
	<div id="shell-chat-pane">
		<div class="-pane-inner">
			<template v-if="chat.populated">
				<AppTabBar class="-nav-tabs">
					<AppTabBarItem
						v-if="chats.length > 0"
						:active="tab === 'chats'"
						@click="tab = 'chats'"
					>
						<AppTranslate>Chats</AppTranslate>
					</AppTabBarItem>
					<AppTabBarItem
						:active="chats.length === 0 || tab === 'friends'"
						@click="tab = 'friends'"
					>
						<AppTranslate>Friends</AppTranslate>
						<span class="badge badge-subtle">
							{{ formatNumber(friendsCount) }}
						</span>
					</AppTabBarItem>
				</AppTabBar>

				<AppIllustration
					v-if="chats.length === 0 || (tab === 'friends' && !friends.length)"
					:asset="illNoCommentsSmall"
				>
					<AppTranslate>No friends yet.</AppTranslate>
				</AppIllustration>
				<AppChatUserList v-else :entries="tab === 'chats' ? chats : friends" />
			</template>
			<template v-else-if="chat.connected">
				<AppLoading centered :label="$gettext(`Loading your chats...`)" />
			</template>
			<template v-else>
				<AppIllustration class="-no-chat" :asset="illMaintenance">
					<p><AppTranslate>The chat server went away...</AppTranslate></p>
					<p><AppTranslate>It should be back shortly.</AppTranslate></p>
				</AppIllustration>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
#shell-chat-pane
	change-bg('bg')
	height: 100%

.-nav-tabs
	padding: 0 4px

.-pane-inner
	display: flex
	flex-direction: column
	height: 100%

.-no-chat
	margin-left: 12px
	margin-right: 12px

	@media $media-md-up
		margin-left: 24px
		margin-right: 24px
</style>
