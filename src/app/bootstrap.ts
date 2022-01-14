import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import { GamePlayModal } from '../_common/game/play-modal/play-modal.service';
import { Registry } from '../_common/registry/registry.service';
import { SidebarStoreKey } from '../_common/sidebar/sidebar.store';
import AppMain from './AppMain.vue';
import './main.styl';
import { BannerStoreKey } from './store/banner';
import { appStore, AppStoreKey, bannerStore, libraryStore, sidebarStore } from './store/index';
import { LibraryStoreKey } from './store/library';
import { router } from './views/index';

export function createApp() {
	const { app } = bootstrapCommon(AppMain, router);

	// Section stores.
	app.provide(BannerStoreKey, bannerStore);
	app.provide(SidebarStoreKey, sidebarStore);
	app.provide(LibraryStoreKey, libraryStore);
	app.provide(AppStoreKey, appStore);

	if (GJ_IS_DESKTOP_APP) {
		// TODO(vue3): we need to do this through a dynamic import, but then this
		// function would need to be async
		// require('./bootstrap-client');
	}

	GamePlayModal.init({ canMinimize: true });

	Registry.setConfig('Game', { maxItems: 100 });
	Registry.setConfig('User', { maxItems: 150 });
	Registry.setConfig('FiresidePost', { maxItems: 50 });

	return { app, router };
}
