import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./learn.html?style=./learn.styl';

import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';

@View
@Component({
	name: 'route-landing-learn',
	components: {
		AppAuthJoin,
	},
})
export default class RouteLandingLearn extends Vue
{
	@State app: AppState;
}
