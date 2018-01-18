import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./history-navigator.html';

import { AppJolticon } from '../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { ClientHistoryNavigator } from './history-navigator.service';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppClientHistoryNavigator extends Vue {
	readonly HistoryNavigator = ClientHistoryNavigator;
}
