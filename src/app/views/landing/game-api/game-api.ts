import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./game-api.html';

import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	name: 'route-landing-game-api',
	directives: {
		AppTooltip,
	},
})
export default class RouteLandingGameApi extends Vue
{
}
