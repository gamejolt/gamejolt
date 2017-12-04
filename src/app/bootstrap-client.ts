import { store } from './store/index';
import { bootstrapCommonClient } from '../_common/client/bootstrap';
import { ClientAutoStart } from '../_common/client/autostart/autostart.service';
import { ClientShortcut } from '../_common/client/shortcut/shortcut.service';
import { AppGamePackageCard } from '../lib/gj-lib-client/components/game/package/card/card';
import { AppClientGameCoverButtons } from './components/client/hooks/game-cover-buttons/game-cover-buttons';
import { AppClientPackageCardButtons } from './components/client/hooks/package-card-buttons/package-card-buttons';
import { AppClientPackageCardMeta } from './components/client/hooks/package-card-meta/package-card-meta';
import { AppGameCoverButtons } from './components/game/cover-buttons/cover-buttons';
import { hookDownloadPackage } from './components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
import AppGamePackagePurchaseModal from '../lib/gj-lib-client/components/game/package/purchase-modal/purchase-modal';
import { AppClientTray } from '../_common/client/tray/tray';
import { clientTrayMenuBuilder } from './components/client/hooks/tray/tray';

bootstrapCommonClient(store);

ClientAutoStart.init();
ClientShortcut.create();

AppClientTray.hook.menuBuilder = clientTrayMenuBuilder;
AppGamePackageCard.hook.buttons = AppClientPackageCardButtons;
AppGamePackageCard.hook.meta = AppClientPackageCardMeta;
AppGameCoverButtons.hook.buildButtons = AppClientGameCoverButtons;
AppGamePackagePurchaseModal.hook.downloadPackage = hookDownloadPackage;
