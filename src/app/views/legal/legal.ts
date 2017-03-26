import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./legal.html';

import { BeforeRouteEnter } from '../../../lib/gj-lib-client/utils/router';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';

@View
@Component({
	name: 'route-legal',
})
export default class RouteLegal extends Vue
{
	@BeforeRouteEnter()
	beforeRoute()
	{
		return User.touch();
	}
}
