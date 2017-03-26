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

Payload.initVue( store );
History.init( router );

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

if ( !GJ_IS_SSR ) {
	const VueShortkey = require( 'vue-shortkey' );
	Vue.use( VueShortkey, {
		prevent: [ 'input', 'textarea' ],
	} );
}

const app = new Vue( {
	store,
	router,
	render: ( h ) => h( App ),
} );

export { app, store, router };
