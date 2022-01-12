import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import { GamePlayModal } from '../_common/game/play-modal/play-modal.service';
import { Registry } from '../_common/registry/registry.service';
import { sidebarStore, SidebarStoreKey } from '../_common/sidebar/sidebar.store';
import { commonStore } from '../_common/store/common-store';
import App from './app.vue';
import './main.styl';
import { BannerStoreKey, createBannerStore } from './store/banner';
import { store } from './store/index';
import { libraryStore, LibraryStoreKey } from './store/library';
import { router } from './views/index';

export function createApp() {
	const app = bootstrapCommon(App, store, router);

	// Section stores.
	app.provide(BannerStoreKey, createBannerStore({ commonStore, router }));
	app.provide(SidebarStoreKey, sidebarStore);
	app.provide(LibraryStoreKey, libraryStore);

	if (GJ_IS_DESKTOP_APP) {
		// TODO: we need to do this through a dynamic import, but then this
		// function would need to be async
		// require('./bootstrap-client');
	}

	GamePlayModal.init({ canMinimize: true });

	Registry.setConfig('Game', { maxItems: 100 });
	Registry.setConfig('User', { maxItems: 150 });
	Registry.setConfig('FiresidePost', { maxItems: 50 });

	return { app, store, router };
}
