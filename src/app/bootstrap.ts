import VueCompositionApi from '@vue/composition-api';
import Vue from 'vue';
import '../utils/polyfills';
import { bootstrapCommon } from '../_common/bootstrap';
import { GamePlayModal } from '../_common/game/play-modal/play-modal.service';
import { Registry } from '../_common/registry/registry.service';
import App from './app.vue';
import './main.styl';
import { store } from './store/index';
import { router } from './views/index';

const _createApp = bootstrapCommon(App, store, router);
export function createApp() {
	return { app: _createApp(), store, router };
}

Vue.use(VueCompositionApi);

if (GJ_IS_CLIENT) {
	require('./bootstrap-client');
}

GamePlayModal.init({ canMinimize: true });

Registry.setConfig('Game', { maxItems: 100 });
Registry.setConfig('User', { maxItems: 150 });
Registry.setConfig('FiresidePost', { maxItems: 50 });
