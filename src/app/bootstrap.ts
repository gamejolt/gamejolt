import { GamePlayModal } from 'game-jolt-frontend-lib/components/game/play-modal/play-modal.service';
import { Registry } from 'game-jolt-frontend-lib/components/registry/registry.service';
import 'game-jolt-frontend-lib/utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import App from './app.vue';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

const _createApp = bootstrapCommon(App, store, router);
export function createApp() {
	return { app: _createApp(), store, router };
}

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}

GamePlayModal.init({ canMinimize: true });
// bootstrapShortkey();

Registry.setConfig('Game', { maxItems: 100 });
Registry.setConfig('User', { maxItems: 150 });
Registry.setConfig('FiresidePost', { maxItems: 50 });
