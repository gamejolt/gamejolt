import '../lib/gj-lib-client/utils/polyfills';
import Vue from 'vue';
const VueGettext = require( 'vue-gettext' );

import { store } from './store/index';
import { router } from './views/index';
import { Payload } from '../lib/gj-lib-client/components/payload/payload-service';
import { App } from './app';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';

Payload.initVue( store );
// Analytics.initVue( $rootScope );
// Meta.initVue( $rootScope );
// Connection.initVue( $rootScope );

const availableLanguages: any = {};
for ( const lang of Translate.langs ) {
	availableLanguages[ lang.code ] = lang.label;
}

Vue.use( VueGettext, {
	availableLanguages,
	defaultLanguage: Translate.lang,
	translations: require( `!!../translations/en_US/auth.json` ),
} );

new Vue( {
	el: '#app',
	store,
	router,
	render: ( h ) => h( App ),
} );
