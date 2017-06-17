import { NgModule } from 'ng-metadata/core';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppTrophyOverview } from './overview';

@NgModule({
	declarations: [makeObservableService(AppTrophyOverview)],
})
export class TrophyOverviewModule {}
