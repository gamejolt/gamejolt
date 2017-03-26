import { NgModule } from 'ng-metadata/core';
import { Shell } from './shell-service';
import { makeComponentProvider } from '../../../lib/gj-lib-client/vue/angular-link';
import { AppShell } from './shell';

@NgModule({
	providers: [
		{ provide: 'Shell', useFactory: () => Shell },
	],
	declarations: [
		makeComponentProvider( AppShell ),
	],
})
export class ShellModule { }
