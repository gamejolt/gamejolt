import Vue from 'vue';

import { AppGamePackageCard } from '../lib/gj-lib-client/components/game/package/card/card';
import { initClientApiInterceptors } from './components/client/api/api.service';
import { ClientAutoStart } from './components/client/autostart/autostart.service';
import { ClientControl } from './components/client/control/client.service';
import { checkClientHiDpi } from './components/client/hidpi/hidpi.service';
import { ClientHistoryNavigator } from './components/client/history-navigator/history-navigator.service';
import { AppClientGameCoverButtons } from './components/client/hooks/game-cover-buttons/game-cover-buttons';
import { AppClientPackageCardButtons } from './components/client/hooks/package-card-buttons/package-card-buttons';
import { AppClientPackageCardMeta } from './components/client/hooks/package-card-meta/package-card-meta';
import { ClientShortcut } from './components/client/shortcut/shortcut.service';
import { ClientUser } from './components/client/user/user.service';
import { AppGameCoverButtons } from './components/game/cover-buttons/cover-buttons';

checkClientHiDpi();
initClientApiInterceptors();
ClientUser.init();
ClientAutoStart.init();
ClientControl.init();
ClientHistoryNavigator.init();
ClientShortcut.create();

AppGamePackageCard.hook.buttons = AppClientPackageCardButtons;
AppGamePackageCard.hook.meta = AppClientPackageCardMeta;
AppGameCoverButtons.hook.buildButtons = AppClientGameCoverButtons;

Vue.use(vue => {
	(vue.prototype as any).GJ_IS_CLIENT = GJ_IS_CLIENT;
});
