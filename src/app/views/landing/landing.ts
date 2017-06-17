import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { BeforeRouteEnter } from '../../../lib/gj-lib-client/utils/router';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@Component({})
export default class RouteLanding extends Vue {
	@BeforeRouteEnter()
	beforeRoute() {
		return User.touch();
	}

	render(h: Vue.CreateElement) {
		return h('router-view');
	}
}
