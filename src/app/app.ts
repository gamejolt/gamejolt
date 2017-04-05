import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./app.html';

import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../lib/gj-lib-client/utils/vue';
import { AppShell } from './components/shell/shell';
import { AppState } from '../lib/gj-lib-client/vue/services/app/app-store';
import { User } from '../lib/gj-lib-client/components/user/user.model';
import { Actions, Mutations } from './store/index';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';

@View
@Component({
	components: {
		AppShell,
		AppErrorPage,
	},
})
export class App extends Vue
{
	@State app: AppState;

	Connection = makeObservableService( Connection );

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

	// Bootstrap/clear the app when user changes.
	@Watch( 'app.user', { immediate: true } )
	async onUserWatch( user: User )
	{
		const isLoggedIn = !!user;

		if ( isLoggedIn ) {
			this.$store.dispatch( Actions.bootstrap );
			this.$store.dispatch( Actions.loadChat );
		}
		else {
			this.$store.commit( Mutations.clear );
			this.$store.commit( Mutations.clearChat );
		}
	}
}
