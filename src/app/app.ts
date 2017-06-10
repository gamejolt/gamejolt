import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./app.html';

import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../lib/gj-lib-client/utils/vue';
import { AppShell } from './components/shell/shell';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { Store } from './store/index';

@View
@Component({
	components: {
		AppShell,
		AppErrorPage,
	},
})
export class App extends Vue
{
	@State app: Store['app'];
	@State isShowingAngular: Store['isShowingAngular'];

	Connection = makeObservableService( Connection );

	created()
	{
	}

	// created()
	// {
	// 	this.loadTranslations();
	// }

	// async loadTranslations()
	// {
	// 	if ( this.$language ) {
	// 		const main = await $import( '!!../../../translations/' + Translate.lang + '/main.json' );
	// 		this.$language.addTranslations( main );
	// 	}
	// }
}
