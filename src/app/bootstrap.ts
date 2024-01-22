import { defineAsyncComponent } from 'vue';
import { bootstrapCommon } from '../_common/bootstrap';
import { setContentEmojiWrapper } from '../_common/content/components/AppContentEmoji.vue';
import { setChatInviteComponent } from '../_common/content/content-viewer/components/AppContentViewerChatInvite.vue';
import { initGamePlayModal } from '../_common/game/play-modal/play-modal.service';
import { addModalBackdropCheck } from '../_common/modal/AppModal.vue';
import handlePayloadActions from '../_common/payload/payload-actions.service';
import { Payload } from '../_common/payload/payload-service';
import { Registry } from '../_common/registry/registry.service';
import { Scroll } from '../_common/scroll/scroll.service';
import { SidebarStoreKey, createSidebarStore } from '../_common/sidebar/sidebar.store';
import { StickerStoreKey, createStickerStore } from '../_common/sticker/sticker-store';
import { initSafeExportsForClient } from './components/client/safe-exports';
import { GridStoreKey, createGridStore } from './components/grid/grid-store';
import './main.styl';
import { BannerStoreKey, createBannerStore } from './store/banner';
import { AppStoreKey, createAppStore } from './store/index';
import { JoltydexStoreKey, createJoltydexStore } from './store/joltydex';
import { LibraryStoreKey, createLibraryStore } from './store/library';
import { QuestStoreKey, createQuestStore } from './store/quest';
import { router } from './views/index';

export async function createApp() {
	const { app, commonStore } = await bootstrapCommon({
		appComponentLoader: async () => (await import('./AppMain.vue')).default,
		initSectionSafeExportsForClient: initSafeExportsForClient,
		router,
	});

	const sidebarStore = createSidebarStore();
	const libraryStore = createLibraryStore({ router });
	const bannerStore = createBannerStore({ commonStore, router });
	const stickerStore = createStickerStore({
		user: commonStore.user,
	});

	const appStore = createAppStore({
		router,
		commonStore,
		sidebarStore,
		libraryStore,
		getQuestStore() {
			return questStore;
		},
		stickerStore,
	});

	const gridStore = createGridStore({ appStore });
	const questStore = createQuestStore({ user: commonStore.user, grid: gridStore.grid });
	const joltydexStore = createJoltydexStore();

	// Section stores.
	app.provide(SidebarStoreKey, sidebarStore);
	app.provide(LibraryStoreKey, libraryStore);
	app.provide(BannerStoreKey, bannerStore);
	app.provide(StickerStoreKey, stickerStore);
	app.provide(AppStoreKey, appStore);
	app.provide(GridStoreKey, gridStore);
	app.provide(QuestStoreKey, questStore);
	app.provide(JoltydexStoreKey, joltydexStore);

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapClient } = await import('./bootstrap-client');
		await bootstrapClient(app, appStore, commonStore);
	}

	// The content viewer component that renders this lives in _common, but it
	// needs to render a component from app. Set the component it should render
	// here.
	const AppContentChatInview = defineAsyncComponent(
		() => import('./components/content/components/AppContentChatInvite.vue')
	);
	setChatInviteComponent(AppContentChatInview);

	// AppContentEmoji needs this, but lives in _common. Need to assign the
	// wrapping component here as well.
	const AppStickerCollectibleWrapper = defineAsyncComponent(
		() => import('./components/sticker/AppStickerCollectibleWrapper.vue')
	);
	setContentEmojiWrapper(AppStickerCollectibleWrapper);

	// PayloadService doesn't play nice with importing certain things.
	Payload.assignPayloadActionsHandler(handlePayloadActions);

	initGamePlayModal({ canMinimize: true });

	Registry.setConfig('Game', { maxItems: 100 });
	Registry.setConfig('User', { maxItems: 150 });
	Registry.setConfig('FiresidePost', { maxItems: 50 });

	// The height of the top nav bar.
	Scroll.setOffsetTop(56);

	// Set up the modals to not dismiss when sticker drawer is active.
	addModalBackdropCheck(() => !stickerStore.isDrawerOpen.value);

	return { app, router };
}
