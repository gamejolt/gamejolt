import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import * as View from '!view!./learn.html?style=./learn.styl';

import { AppAuthJoin } from '../../../../lib/gj-lib-client/components/auth/join/join';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppAuthJoin,
	},
})
export default class RouteLandingLearn extends Vue
{
	@State app: Store['app'];
}
