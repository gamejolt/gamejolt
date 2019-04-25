import AppGamePackageCardTS from 'game-jolt-frontend-lib/components/game/package/card/card';
import AppGamePackageCard from 'game-jolt-frontend-lib/components/game/package/card/card.vue';
import AppGamePackagePurchaseModal from 'game-jolt-frontend-lib/components/game/package/purchase-modal/purchase-modal';
import { ClientAutoStart } from '../_common/client/autostart/autostart.service';
import { bootstrapCommonClient } from '../_common/client/bootstrap';
import { ClientShortcut } from '../_common/client/shortcut/shortcut.service';
import { AppClientTray } from '../_common/client/tray/tray';
import AppClientGameCoverButtons from './components/client/hooks/game-cover-buttons/game-cover-buttons.vue';
import { hookDownloadPackage } from './components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
import AppClientPackageCardButtons from './components/client/hooks/package-card-buttons/package-card-buttons.vue';
import AppClientPackageCardMeta from './components/client/hooks/package-card-meta/package-card-meta.vue';
import { clientTrayMenuBuilder } from './components/client/hooks/tray/tray';
import AppGameCoverButtons from './components/game/cover-buttons/cover-buttons';
import { store } from './store/index';

bootstrapCommonClient(store);

ClientAutoStart.init();
ClientShortcut.create();

AppClientTray.hook.menuBuilder = clientTrayMenuBuilder;
(AppGamePackageCard as typeof AppGamePackageCardTS).hook.buttons = AppClientPackageCardButtons;
(AppGamePackageCard as typeof AppGamePackageCardTS).hook.meta = AppClientPackageCardMeta;
AppGameCoverButtons.hook.buildButtons = AppClientGameCoverButtons;
AppGamePackagePurchaseModal.hook.downloadPackage = hookDownloadPackage;
