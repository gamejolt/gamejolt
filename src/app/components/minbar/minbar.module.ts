import { NgModule } from 'ng-metadata/core';
import { Minbar } from './minbar.service';

@NgModule({
	providers: [
		{ provide: 'Minbar', useFactory: () => Minbar },
	],
})
export class MinbarModule { }
