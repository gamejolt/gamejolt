import { NgModule } from 'ng-metadata/core';
import { makeComponentProvider } from '../../../lib/gj-lib-client/vue/angular-link';
import { AppMeter } from './meter';

@NgModule({
	declarations: [
		makeComponentProvider( AppMeter ),
	],
})
export class MeterModule { }
