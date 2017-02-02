import { NgModule } from 'ng-metadata/core';
import { Search } from './search-service';
import { SearchComponent } from './search-directive';

import { SearchAutocompleteModule } from './autocomplete/autocomplete.module';
import { SearchInputModule } from './input/input.module';
import { SearchHistoryModule } from './history/history.module';

@NgModule({
	imports: [
		SearchHistoryModule,
		SearchAutocompleteModule,
		SearchInputModule,
	],
	declarations: [
		SearchComponent,
	],
	providers: [
		Search,
	],
})
export class SearchModule { }
