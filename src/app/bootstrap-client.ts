import { ClientAutoStart } from '../_common/client/autostart/autostart.service';
import { bootstrapCommonClient } from '../_common/client/bootstrap';
import { ClientShortcut } from '../_common/client/shortcut/shortcut.service';
// import { AppClientTray } from '../_common/client/tray/tray';
// import AppGamePackageCard from '../_common/game/package/card/card.vue';
// import AppGamePackagePurchaseModal from '../_common/game/package/purchase-modal/purchase-modal.vue';
import type { CommonStore } from '../_common/store/common-store';
// import AppClientGameCoverButtons from './components/client/hooks/game-cover-buttons/game-cover-buttons.vue';
// import { hookDownloadPackage } from './components/client/hooks/game-package-purchase-modal/game-package-purchase-modal';
// import AppClientPackageCardButtons from './components/client/hooks/package-card-buttons/package-card-buttons.vue';
// import AppClientPackageCardMeta from './components/client/hooks/package-card-meta/package-card-meta.vue';
// import { clientTrayMenuBuilder } from './components/client/hooks/tray/tray';
// import AppGameCoverButtons from './components/game/cover-buttons/cover-buttons.vue';

export function bootstrapClient({ commonStore }: { commonStore: CommonStore }) {
	bootstrapCommonClient({ commonStore });

	ClientAutoStart.init();
	ClientShortcut.create();

	// AppClientTray.hook.menuBuilder = clientTrayMenuBuilder;
	// AppGamePackageCard.hook.buttons = AppClientPackageCardButtons;
	// AppGamePackageCard.hook.meta = AppClientPackageCardMeta;
	// AppGameCoverButtons.hook.buildButtons = AppClientGameCoverButtons;
	// AppGamePackagePurchaseModal.hook.downloadPackage = hookDownloadPackage;
}
