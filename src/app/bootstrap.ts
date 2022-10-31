import { bootstrapCommon } from '../_common/bootstrap';
import { GamePlayModal } from '../_common/game/play-modal/play-modal.service';
import { Registry } from '../_common/registry/registry.service';
import { Scroll } from '../_common/scroll/scroll.service';
import { createSidebarStore, SidebarStoreKey } from '../_common/sidebar/sidebar.store';
import { createStickerStore, StickerStoreKey } from '../_common/sticker/sticker-store';
import { initSafeExportsForClient } from './components/client/safe-exports';
import { createFiresideStore, FiresideStoreKey } from './components/fireside/fireside.store';
import { createGridStore, GridStoreKey } from './components/grid/grid-store';
import './main.styl';
import { BannerStoreKey, createBannerStore } from './store/banner';
import { AppStoreKey, createAppStore } from './store/index';
import { createLibraryStore, LibraryStoreKey } from './store/library';
import { createQuestStore, QuestStoreKey } from './store/quest';
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

	const firesideStore = createFiresideStore();

	// Section stores.
	app.provide(SidebarStoreKey, sidebarStore);
	app.provide(LibraryStoreKey, libraryStore);
	app.provide(BannerStoreKey, bannerStore);
	app.provide(StickerStoreKey, stickerStore);
	app.provide(AppStoreKey, appStore);
	app.provide(GridStoreKey, gridStore);
	app.provide(QuestStoreKey, questStore);
	app.provide(FiresideStoreKey, firesideStore);

	if (GJ_IS_DESKTOP_APP) {
		const { bootstrapClient } = await import('./bootstrap-client');
		await bootstrapClient(app, appStore, commonStore);
	}

	GamePlayModal.init({ canMinimize: true });

	Registry.setConfig('Game', { maxItems: 100 });
	Registry.setConfig('User', { maxItems: 150 });
	Registry.setConfig('FiresidePost', { maxItems: 50 });

	// The height of the top nav bar.
	Scroll.setOffsetTop(56);

	return { app, router };
}
