import { NgModule } from 'ng-metadata/core';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppTrophyCompletion } from './completion';

@NgModule({
	declarations: [
		makeObservableService( AppTrophyCompletion ),
	],
})
export class TrophyCompletionModule { }
