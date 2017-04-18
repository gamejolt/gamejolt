import '../lib/gj-lib-client/utils/polyfills';

// This has to go first so the popstate event gets attached first.
import { History } from '../lib/gj-lib-client/components/history/history.service';

import Vue from 'vue';
const VueGettext = require( 'vue-gettext' );

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';
import { bootstrapShortkey } from '../lib/gj-lib-client/vue/shortkey';
import { Scroll } from '../lib/gj-lib-client/components/scroll/scroll.service';
import { Registry } from '../lib/gj-lib-client/components/registry/registry.service';
import { GamePlayModal } from '../lib/gj-lib-client/components/game/play-modal/play-modal.service';

Payload.init( store, router );
History.init( router );
GamePlayModal.init( { canMinimize: true } );
bootstrapShortkey();

Registry.setConfig( 'Game', { maxItems: 100 } );
Registry.setConfig( 'FiresidePost', { maxItems: 50 } );
Registry.setConfig( 'User', { maxItems: 100 } );

// Match this to the shell top nav height.
Scroll.setOffsetTop( 50 );

const availableLanguages: any = {};
for ( const lang of Translate.langs ) {
	availableLanguages[ lang.code ] = lang.label;
}

Vue.use( VueGettext, {
	silent: true,
	availableLanguages,
	defaultLanguage: Translate.lang,
	translations: require( `!!../translations/en_US/main.json` ),
} );

const app = new Vue( {
	store,
	router,
	render: ( h ) => h( App ),
} );

export { app, store, router };
