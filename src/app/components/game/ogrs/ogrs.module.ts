import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGameOgrsTag } from './tag';
import { AppGameOgrs } from './ogrs';

@NgModule({
	declarations: [
		makeComponentProvider(AppGameOgrsTag),
		makeComponentProvider(AppGameOgrs),
	],
})
export class GameOgrsModule {}
