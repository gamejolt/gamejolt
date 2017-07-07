import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { RouteResolve } from '../../../lib/gj-lib-client/utils/router';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@Component({})
export default class RouteLanding extends Vue {
	@RouteResolve()
	beforeRoute() {
		return User.touch();
	}

	render(h: Vue.CreateElement) {
		return h('router-view');
	}
}
