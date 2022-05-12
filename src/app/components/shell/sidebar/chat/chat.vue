<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { EscapeStack } from '../../../../../_common/escape-stack/escape-stack.service';
import { formatNumber } from '../../../../../_common/filters/number';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { illMaintenance } from '../../../../img/ill/illustrations';
import { useAppStore } from '../../../../store';
import { ChatStore, ChatStoreKey } from '../../../chat/chat-store';
import { enterChatRoom, leaveChatRoom } from '../../../chat/client';
import { sortByLastMessageOn } from '../../../chat/user-collection';
import AppChatUserList from '../../../chat/user-list/user-list.vue';

@Options({
	components: {
		AppChatUserList,
		AppIllustration,
		AppLoading,
	},
})
export default class AppShellSidebarChat extends Vue {
	store = setup(() => useAppStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}

	tab: 'chats' | 'friends' = 'chats';

	private escapeCallback?: () => void;

	readonly Screen = Screen;
	readonly illMaintenance = illMaintenance;

	get chat() {
		return this.chatStore.chat!;
	}

	get friends() {
		return this.chat.friendsList.collection;
	}

	get groups() {
		return this.chat.groupRooms;
	}

	get chats() {
		return sortByLastMessageOn([...this.groups, ...this.friends]);
	}

	get hasGroupRooms() {
		return this.groups.length > 0;
	}

	get friendsCount() {
		return this.chat.friendsList.collection.length;
	}

	get friendsCountLocalized() {
		return formatNumber(this.friendsCount);
	}

	mounted() {
		// xs size needs to show the friends list
		if (this.chat.sessionRoomId && !Screen.isXs) {
			enterChatRoom(this.chat, this.chat.sessionRoomId);
		}

		this.escapeCallback = () => this.hideChatPane();
		EscapeStack.register(this.escapeCallback);
	}

	unmounted() {
		if (this.escapeCallback) {
			EscapeStack.deregister(this.escapeCallback);
			this.escapeCallback = undefined;
		}

		leaveChatRoom(this.chat);
	}

	hideChatPane() {
		if (this.visibleLeftPane === 'chat') {
			this.store.toggleLeftPane('chat');
		}
	}
}
</script>

<template>
	<div id="shell-chat-pane">
		<div class="chat-sidebar">
			<template v-if="chat.populated">
				<nav class="shell-nav-inline platform-list inline">
					<ul>
						<li v-if="chats.length > 0">
							<a :class="{ active: tab === 'chats' }" @click="tab = 'chats'">
								<AppTranslate>Chats</AppTranslate>
							</a>
						</li>
						<li>
							<a
								:class="{ active: chats.length === 0 || tab === 'friends' }"
								@click="tab = 'friends'"
							>
								<AppTranslate>Friends</AppTranslate>
								<span class="badge badge-subtle">
									{{ friendsCountLocalized }}
								</span>
							</a>
						</li>
					</ul>
				</nav>

				<div
					v-if="chats.length === 0 || (tab === 'friends' && !friends.length)"
					class="nav-well"
				>
					<AppTranslate>No friends yet.</AppTranslate>
				</div>
				<AppChatUserList v-else :entries="tab === 'chats' ? chats : friends" />
			</template>
			<template v-else-if="chat.connected">
				<AppLoading centered :label="$gettext(`Loading your chats...`)" />
			</template>
			<template v-else>
				<AppIllustration class="-no-chat" :src="illMaintenance">
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
	padding-top: 20px

.-no-chat
	margin-left: 12px
	margin-right: 12px

	@media $media-md-up
		margin-left: 24px
		margin-right: 24px
</style>
