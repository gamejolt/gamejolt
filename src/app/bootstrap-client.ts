import { App } from 'vue';
import { ClientAutoStart } from '../_common/client/autostart/autostart.service';
import { bootstrapCommonClient } from '../_common/client/bootstrap';
import { ClientShortcut } from '../_common/client/shortcut/shortcut.service';
import { setMenuBuilderHook } from '../_common/client/tray/AppClientTray.vue';
import {
	setButtonsComponent as setPackageCardButtonsComponent,
	setMetaComponent,
} from '../_common/game/package/card/card.vue';
import { setDownloadPackageHook } from '../_common/game/package/purchase-modal/AppGamePackagePurchaseModal.vue';
import type { CommonStore } from '../_common/store/common-store';
import AppClientGameCoverButtons from './components/client/hooks/game-cover-buttons/game-cover-buttons.vue';
import { makeDownloadPackageHook } from './components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
import AppClientPackageCardButtons from './components/client/hooks/package-card-buttons/package-card-buttons.vue';
import AppClientPackageCardMeta from './components/client/hooks/package-card-meta/AppClientPackageCardMeta.vue';
import { createClientTrayMenuBuilder } from './components/client/hooks/tray/tray';
import { setBuildButtonsComponent } from './components/game/cover-buttons/cover-buttons.vue';
import { setClientLibraryStore } from './components/search/search-service';
import { ClientLibraryStoreKey, createClientLibraryStore } from './store/client-library';
import { router } from './views/index';

export function bootstrapClient(app: App, commonStore: CommonStore) {
	bootstrapCommonClient({ commonStore });

	const clientLibraryStore = createClientLibraryStore();
	app.provide(ClientLibraryStoreKey, clientLibraryStore);

	ClientAutoStart.init();
	ClientShortcut.create();

	setPackageCardButtonsComponent(AppClientPackageCardButtons);
	setMetaComponent(AppClientPackageCardMeta);
	setDownloadPackageHook(makeDownloadPackageHook(clientLibraryStore));
	setMenuBuilderHook(createClientTrayMenuBuilder(router));
	setClientLibraryStore(clientLibraryStore);
	setBuildButtonsComponent(AppClientGameCoverButtons);
}
