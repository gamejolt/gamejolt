import { NgModule } from 'ng-metadata/core';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppTrophyList } from './list';

@NgModule({
	declarations: [makeObservableService(AppTrophyList)],
})
export class TrophyListModule {}
