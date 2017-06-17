import Vue from 'vue';
import { Mutation } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./join.html';

import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Store } from '../../../store/index';
import { BeforeRouteEnter } from '../../../../lib/gj-lib-client/utils/router';
import { loggedUserBlock } from '../auth';

@View
@Component({
	components: {
		AppJolticon,
		AppAuthJoin,
	},
})
export default class RouteAuthJoin extends Vue {
	@Mutation setCredentials: Store['setCredentials'];

	Connection = makeObservableService(Connection);

	@BeforeRouteEnter()
	routeEnter() {
		return loggedUserBlock();
	}

	created() {
		Meta.title = this.$gettext('auth.join.page_title');
	}

	onJoin(formModel: any) {
		// We store these so we can log them in automatically once their
		// verification happens.
		this.setCredentials({
			username: formModel.username,
			password: formModel.password,
		});

		this.$router.push({ name: 'auth.join-almost' });
	}
}
