import '../vendor/base';

import '../bower-lib/angular-credit-cards/release/angular-credit-cards';
import '../bower-lib/angular-ui-mask/dist/mask.min';

import { platformBrowserDynamic } from 'ng-metadata/platform-browser-dynamic';
import { enableProdMode } from 'ng-metadata/core';
import { AppModule } from './app.module';

if ( GJ_BUILD_TYPE == 'production' ) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule( AppModule );
