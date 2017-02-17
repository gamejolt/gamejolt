import { NgModule } from 'ng-metadata/core';
import { makeProvider } from '../../../lib/gj-lib-client/utils/angular-facade';
import { Settings } from './settings.service';

@NgModule({
	providers: [
		makeProvider( 'Settings', Settings ),
	],
})
export class SettingsModule { }
