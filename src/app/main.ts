import './vendor';
import * as Vue from 'vue';
const GetTextPlugin = require( 'vue-gettext' );
const VueShortkey = require( 'vue-shortkey' );

import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';
import { AppModule } from './app.module';

import { Loader } from '../lib/gj-lib-client/components/loader/loader.service';
import { HammerLoader } from '../lib/gj-lib-client/components/loader/hammer-loader';
import { HammerVueLoader } from '../lib/gj-lib-client/components/loader/hammer-vue-loader';
import { UploadLoader } from '../lib/gj-lib-client/components/loader/upload-loader';
import { JqueryLoader } from '../lib/gj-lib-client/components/loader/jquery-loader';
import { UiTreeLoader } from '../lib/gj-lib-client/components/loader/ui-tree-loader';
import { JcropLoader } from '../lib/gj-lib-client/components/loader/jcrop-loader';
import { ChartLoader } from '../lib/gj-lib-client/components/loader/chart-loader';
import { SpectrumLoader } from '../lib/gj-lib-client/components/loader/spectrum-loader';
import { Translate } from '../lib/gj-lib-client/components/translate/translate.service';

const availableLanguages: any = {};
for ( const lang of Translate.langs ) {
	availableLanguages[ lang.code ] = lang.label;
}

Vue.use( GetTextPlugin, {
	availableLanguages,
	defaultLanguage: Translate.lang,
	translations: {},
} );

Vue.use( VueShortkey );

Loader.addLoader( new HammerLoader() );
Loader.addLoader( new HammerVueLoader() );
Loader.addLoader( new UploadLoader() );
Loader.addLoader( new JqueryLoader() );
Loader.addLoader( new UiTreeLoader() );
Loader.addLoader( new JcropLoader() );
Loader.addLoader( new ChartLoader() );
Loader.addLoader( new SpectrumLoader() );

if ( GJ_BUILD_TYPE === 'production' ) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule( AppModule );
