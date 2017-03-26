import '../vendor/base';
import '../bower-lib/angular-ui-utils/keypress.min';
import '../bower-lib/angular-elastic/elastic';
import './main-ng.styl';

import { enableProdMode } from 'ng-metadata/core';
import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { AppModule } from './app.module';

(window as any).humanizeDuration = require( '../bower-lib/humanize-duration/humanize-duration' );

if ( GJ_BUILD_TYPE === 'production' ) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule( AppModule );
