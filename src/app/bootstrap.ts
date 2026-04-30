import '~app/main.styl';

import { defineAsyncComponent } from 'vue';

import { initSafeExportsForClient } from '~app/components/client/safe-exports';
import { createGridStore, GridStoreKey } from '~app/components/grid/grid-store';
import { BannerStoreKey, createBannerStore } from '~app/store/banner';
import { AppStoreKey, createAppStore } from '~app/store/index';
import { createJoltydexStore, JoltydexStoreKey } from '~app/store/joltydex';
import { createLibraryStore, LibraryStoreKey } from '~app/store/library';
import { createQuestStore, QuestStoreKey } from '~app/store/quest';
import { createAppRouter } from '~app/views/index';
import { bootstrapCommon } from '~common/bootstrap';
import { setContentEmojiWrapper } from '~common/content/components/AppContentEmoji.vue';
import { setChatInviteComponent } from '~common/content/content-viewer/components/AppContentViewerChatInvite.vue';
import { createGamePlayStore, GamePlayStoreKey } from '~common/game/play-modal/play-modal.service';
import { createMinbarStore, MinbarStoreKey } from '~common/minbar/minbar.service';
import { addModalBackdropCheck } from '~common/modal/AppModal.vue';
import { setRegistryConfig } from '~common/registry/registry.service';
import { setScrollOffsetTop } from '~common/scroll/scroll.service';
import { createSidebarStore, SidebarStoreKey } from '~common/sidebar/sidebar.store';
import { createStickerStore, StickerStoreKey } from '~common/sticker/sticker-store';

export async function createApp() {
	const router = createAppRouter();

	const { app, commonStore, backdropStore } = await bootstrapCommon({
		appComponentLoader: async () => (await import('~app/AppMain.vue')).default,
		initSectionSafeExportsForClient: initSafeExportsForClient,
		router,
	});

	const sidebarStore = createSidebarStore();
	const libraryStore = createLibraryStore();
	const bannerStore = createBannerStore({ commonStore });
	const stickerStore = createStickerStore({
		user: commonStore.user,
	});

	const appStore = createAppStore({
		commonStore,
		backdropStore,
		sidebarStore,
		libraryStore,
		// Because of circular dependencies.
		getQuestStore() {
			return questStore;
		},
		stickerStore,
	});

	const gridStore = createGridStore({ appStore });
	const questStore = createQuestStore({ user: commonStore.user, grid: gridStore.grid });
	const joltydexStore = createJoltydexStore();

	// Section stores.
	app.provide(GamePlayStoreKey, createGamePlayStore({ canMinimize: true }));
	app.provide(MinbarStoreKey, createMinbarStore());
	app.provide(SidebarStoreKey, sidebarStore);
	app.provide(LibraryStoreKey, libraryStore);
	app.provide(BannerStoreKey, bannerStore);
	app.provide(StickerStoreKey, stickerStore);
	app.provide(AppStoreKey, appStore);
	app.provide(GridStoreKey, gridStore);
	app.provide(QuestStoreKey, questStore);
	app.provide(JoltydexStoreKey, joltydexStore);

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapClient } = await import('~app/bootstrap-client');
		await bootstrapClient({ app, appStore, commonStore });
	}

	// The content viewer component that renders this lives in _common, but it
	// needs to render a component from app. Set the component it should render
	// here.
	const AppContentChatInview = defineAsyncComponent(
		() => import('~app/components/content/components/AppContentChatInvite.vue')
	);
	setChatInviteComponent(AppContentChatInview);

	// AppContentEmoji needs this, but lives in _common. Need to assign the
	// wrapping component here as well.
	const AppStickerCollectibleWrapper = defineAsyncComponent(
		() => import('~app/components/sticker/AppStickerCollectibleWrapper.vue')
	);
	setContentEmojiWrapper(AppStickerCollectibleWrapper);

	setRegistryConfig('Game', { maxItems: 100 });
	setRegistryConfig('User', { maxItems: 150 });
	setRegistryConfig('FiresidePost', { maxItems: 50 });

	// The height of the top nav bar.
	setScrollOffsetTop(56);

	// Set up the modals to not dismiss when sticker drawer is active.
	addModalBackdropCheck(() => !stickerStore.isDrawerOpen.value);

	return { app, router };
}
