import { App, markRaw } from 'vue';
import { ClientAutoStart } from '../_common/client/autostart/autostart.service';
import { bootstrapCommonClient } from '../_common/client/bootstrap';
import { ClientShortcut } from '../_common/client/shortcut/shortcut.service';
import { ClientComponents as GamePackageCardClientComponents } from '../_common/game/package/card/card.vue';
import { setDownloadPackageHook } from '../_common/game/package/purchase-modal/AppGamePackagePurchaseModal.vue';
// import AppClientPackageCardMeta from './components/client/hooks/package-card-meta/package-card-meta.vue';
// import { clientTrayMenuBuilder } from './components/client/hooks/tray/tray';
// import AppGameCoverButtons from './components/game/cover-buttons/cover-buttons.vue';
// import { AppClientTray } from '../_common/client/tray/tray';
// import AppGamePackageCard from '../_common/game/package/card/card.vue';
import type { CommonStore } from '../_common/store/common-store';
// import AppGamePackagePurchaseModal from '../_common/game/package/purchase-modal/purchase-modal.vue';
// import AppClientGameCoverButtons from './components/client/hooks/game-cover-buttons/game-cover-buttons.vue';
import { makeDownloadPackageHook } from './components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
import AppClientPackageCardButtons from './components/client/hooks/package-card-buttons/package-card-buttons.vue';
import { ClientLibraryStoreKey, createClientLibraryStore } from './store/client-library';

export function bootstrapClient(app: App, commonStore: CommonStore) {
	bootstrapCommonClient({ commonStore });

	const clientLibraryStore = createClientLibraryStore();
	app.provide(ClientLibraryStoreKey, clientLibraryStore);

	ClientAutoStart.init();
	ClientShortcut.create();

	GamePackageCardClientComponents.value.buttons = markRaw(AppClientPackageCardButtons);
	setDownloadPackageHook(makeDownloadPackageHook(clientLibraryStore));

	// AppClientTray.hook.menuBuilder = clientTrayMenuBuilder;
	// AppGamePackageCard.hook.buttons = AppClientPackageCardButtons;
	// AppGamePackageCard.hook.meta = AppClientPackageCardMeta;
	// AppGameCoverButtons.hook.buildButtons = AppClientGameCoverButtons;
	// AppGamePackagePurchaseModal.hook.downloadPackage = hookDownloadPackage;
}
