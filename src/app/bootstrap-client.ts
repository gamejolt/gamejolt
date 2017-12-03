import Vue from 'vue';

import { initClientApiInterceptors } from '../_common/client/api/api.service';
import { ClientAutoStart } from '../_common/client/autostart/autostart.service';
import { Client } from '../_common/client/client.service';
import { checkClientHiDpi } from '../_common/client/hidpi/hidpi.service';
import { ClientHistoryNavigator } from '../_common/client/history-navigator/history-navigator.service';
import { ClientShortcut } from '../_common/client/shortcut/shortcut.service';
import { AppGamePackageCard } from '../lib/gj-lib-client/components/game/package/card/card';
import { AppClientGameCoverButtons } from './components/client/hooks/game-cover-buttons/game-cover-buttons';
import { AppClientPackageCardButtons } from './components/client/hooks/package-card-buttons/package-card-buttons';
import { AppClientPackageCardMeta } from './components/client/hooks/package-card-meta/package-card-meta';
import { ClientUser } from './components/client/user/user.service';
import { AppGameCoverButtons } from './components/game/cover-buttons/cover-buttons';
import { hookDownloadPackage } from './components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
import AppGamePackagePurchaseModal from '../lib/gj-lib-client/components/game/package/purchase-modal/purchase-modal';

checkClientHiDpi();
initClientApiInterceptors();
ClientUser.init();
ClientAutoStart.init();
Client.init();
ClientHistoryNavigator.init();
ClientShortcut.create();

AppGamePackageCard.hook.buttons = AppClientPackageCardButtons;
AppGamePackageCard.hook.meta = AppClientPackageCardMeta;
AppGameCoverButtons.hook.buildButtons = AppClientGameCoverButtons;
AppGamePackagePurchaseModal.hook.downloadPackage = hookDownloadPackage;

Vue.use(vue => {
	(vue.prototype as any).GJ_IS_CLIENT = GJ_IS_CLIENT;
});
