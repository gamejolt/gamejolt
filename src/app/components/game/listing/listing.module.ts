import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGameListing } from './listing';

@NgModule({
	declarations: [
		makeComponentProvider( AppGameListing ),
	],
})
export class GameListingModule { }
