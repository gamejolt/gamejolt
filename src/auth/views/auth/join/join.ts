import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./join.html';

import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { appStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import { Mutations } from '../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthJoin,
	},
	beforeRouteEnter( _to, _from, next )
	{
		// Redirect right away if they are logged in.
		if ( appStore.state && appStore.state.user ) {
			Auth.redirectDashboard();
			return next( false );
		}
		next();
	}
})
export default class RouteAuthJoin extends Vue
{
	Connection = makeObservableService( Connection );

	created()
	{
		Meta.title = this.$gettext( 'auth.join.page_title' );
	}

	onJoin( formModel: any )
	{
		// We store these so we can log them in automatically once their
		// verification happens.
		this.$store.commit( Mutations.setCredentials, {
			username: formModel.username,
			password: formModel.password,
		} );

		this.$router.push( { name: 'auth.join-almost' } );
	}
}
