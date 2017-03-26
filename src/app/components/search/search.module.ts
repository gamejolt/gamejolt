import { NgModule } from 'ng-metadata/core';
import { Search } from './search-service';
import { makeComponentProvider } from '../../../lib/gj-lib-client/vue/angular-link';
import { AppSearch } from './search';

@NgModule({
	providers: [
		{ provide: 'Search', useFactory: () => Search },
	],
	declarations: [
		makeComponentProvider( AppSearch ),
	]
})
export class SearchModule { }
