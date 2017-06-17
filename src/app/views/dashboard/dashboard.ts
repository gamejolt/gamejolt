import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./dashboard.html';

import { Store } from '../../store/index';

@View
@Component({})
export default class RouteDash extends Vue {
	@State app: Store['app'];
}
