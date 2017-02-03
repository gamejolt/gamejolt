import { NgModule } from 'ng-metadata/core';

import { importContext } from '../../lib/gj-lib-client/utils/utils';

angular.module( 'App.Views', [] );

@NgModule({
	imports: [
		'App.Views',
	],
})
export class ViewsModule { }

importContext( require.context( './', true, /\.state\.ts$/ ) );
importContext( require.context( './', true, /\-(state|controller)\.js$/ ) );
