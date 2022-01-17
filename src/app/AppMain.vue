<script lang="ts" setup>
import { onMounted, provide, reactive, watch } from '@vue/runtime-core';
import { RouterView } from 'vue-router';
import { AppPromotionStore, AppPromotionStoreKey } from '../utils/mobile-app';
import { createAdsController } from '../_common/ad/ad-store';
import { CommentStoreManager, CommentStoreManagerKey } from '../_common/comment/comment-store';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { createDrawerStore } from '../_common/drawer/drawer-store';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/AppCommonShell.vue';
import { useCommonStore } from '../_common/store/common-store';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import { ChatStore, ChatStoreKey, clearChat, loadChat } from './components/chat/chat-store';
import AppShell from './components/shell/shell.vue';
import { useAppStore } from './store';

const { bootstrap, loadGrid, loadNotificationState, clear, clearGrid, clearNotificationState } =
	useAppStore();
const { user } = useCommonStore();

createAdsController();
createDrawerStore();
provide(CommentStoreManagerKey, reactive(new CommentStoreManager()));
provide(AppPromotionStoreKey, reactive(new AppPromotionStore()));

const chatStore = reactive(new ChatStore()) as ChatStore;
provide(ChatStoreKey, chatStore);

if (!import.meta.env.SSR) {
	performance.measure('gj-shell-init', 'gj-start');
}

onMounted(() => {
	// Let it finish doing all the initial rendering junk and track after
	// that.
	setTimeout(() => {
		performance.measure('gj-shell-mounted', 'gj-start');
	});

	loadCurrentLanguage();
});

// When the user changes, we need to change our global app state.
watch(
	() => user.value?.id,
	userId => {
		const isLoggedIn = !!userId;

		if (isLoggedIn) {
			bootstrap();

			if (!import.meta.env.SSR) {
				loadChat(chatStore);
				loadGrid();
				loadNotificationState();
			}

			if (GJ_IS_DESKTOP_APP) {
				// clientLibrary.bootstrap();
			}
		} else {
			clear();
			clearGrid();
			clearNotificationState();
			clearChat(chatStore);
		}
	},
	{ immediate: true }
);
</script>

<template>
	<AppCommonShell>
		<AppCookieBanner />

		<AppShell>
			<div id="content">
				<AppErrorPage>
					<RouterView />
				</AppErrorPage>
			</div>
		</AppShell>
	</AppCommonShell>
</template>
