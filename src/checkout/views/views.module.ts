import { NgModule } from 'ng-metadata/core';

import { importContext } from '../../lib/gj-lib-client/utils/utils';
import Checkout from './checkout/checkout';

angular.module( 'App.Views', [] );

@NgModule({
	imports: [
		'App.Views',
		Checkout,
	],
})
export class ViewsModule { }

importContext( require.context( './', true, /\.state\.ts$/ ) );
importContext( require.context( './', true, /\-(state|controller)\.js$/ ) );
