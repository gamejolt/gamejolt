import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../../lib/gj-lib-client/vue/angular-link';
import { AppGameGrid } from './grid';

@NgModule({
	declarations: [
		makeComponentProvider( AppGameGrid ),
	],
})
export class GameGridModule { }
