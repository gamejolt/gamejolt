import { NgModule } from 'ng-metadata/core';
import { SearchHistory } from './history-service';
import { SearchHistoryComponent } from './history-directive';

@NgModule({
	declarations: [
		SearchHistoryComponent,
	],
	providers: [
		SearchHistory,
	],
})
export class SearchHistoryModule { }
