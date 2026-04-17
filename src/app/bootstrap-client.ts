import { App } from 'vue';

import AppClientPackageCardButtons from '~app/components/client/hooks/AppClientPackageCardButtons.vue';
import AppClientPackageCardMeta from '~app/components/client/hooks/AppClientPackageCardMeta.vue';
import { makeDownloadPackageHook } from '~app/components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
import { createClientTrayMenuBuilder } from '~app/components/client/hooks/tray/tray';
import { setClientLibraryStore } from '~app/components/search/search-service';
import { AppStore } from '~app/store';
import { ClientLibraryStoreKey, createClientLibraryStore } from '~app/store/client-library';
import { router } from '~app/views/index';
import { ClientAutoStart } from '~common/client/autostart/autostart.service';
import { bootstrapCommonClient } from '~common/client/bootstrap';
import { ClientShortcut } from '~common/client/shortcut/shortcut.service';
import { setMenuBuilderHook } from '~common/client/tray/AppClientTray.vue';
import {
	setButtonsComponent as setPackageCardButtonsComponent,
	setMetaComponent,
} from '~common/game/package/card/AppGamePackageCard.vue';
import { setDownloadPackageHook } from '~common/game/package/purchase-modal/AppGamePackagePurchaseModal.vue';
import type { CommonStore } from '~common/store/common-store';

export async function bootstrapClient(app: App, appStore: AppStore, commonStore: CommonStore) {
	bootstrapCommonClient({ commonStore });

	const clientLibraryStore = createClientLibraryStore();
	app.provide(ClientLibraryStoreKey, clientLibraryStore);

	ClientAutoStart.init();
	ClientShortcut.create();

	setPackageCardButtonsComponent(AppClientPackageCardButtons);
	setMetaComponent(AppClientPackageCardMeta);
	setDownloadPackageHook(makeDownloadPackageHook(clientLibraryStore));
	setMenuBuilderHook(createClientTrayMenuBuilder(router, appStore));
	setClientLibraryStore(clientLibraryStore);
}
