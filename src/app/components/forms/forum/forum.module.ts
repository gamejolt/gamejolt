import { NgModule } from 'ng-metadata/core';
import { importContext } from '../../../../lib/gj-lib-client/utils/utils';

angular.module( 'App.Forms.Forum', [] );

importContext( require.context( './', true, /\.js$/ ) );

@NgModule({
	imports: [
		'App.Forms.Forum',
	],
})
export class FormsForumModule { }
