import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppMediaItemCover } from './cover';

@NgModule({
	declarations: [makeComponentProvider(AppMediaItemCover)],
})
export class MediaItemCoverModule {}
