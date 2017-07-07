import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./legal.html';

import { RouteResolve } from '../../../lib/gj-lib-client/utils/router';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({})
export default class RouteLegal extends Vue {
	@RouteResolve()
	beforeRoute() {
		return User.touch();
	}
}
