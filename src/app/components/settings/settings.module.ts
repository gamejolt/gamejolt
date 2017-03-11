import { NgModule } from 'ng-metadata/core';
import { Settings } from './settings.service';

@NgModule({
	providers: [
		{ provide: 'Settings', useFactory: () => Settings },
	],
})
export class SettingsModule { }
