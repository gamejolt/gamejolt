import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGameCompatIcons } from './compat-icons';

@NgModule({
	declarations: [
		makeComponentProvider( AppGameCompatIcons ),
	],
})
export class GameCompatIconsModule { }
