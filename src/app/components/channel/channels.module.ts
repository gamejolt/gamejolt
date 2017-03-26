import { NgModule } from 'ng-metadata/core';
import { Channels } from './channels-service';

@NgModule({
	providers: [
		{ provide: 'Channels', useFactory: () => Channels },
	],
})
export class ChannelsModule { }
