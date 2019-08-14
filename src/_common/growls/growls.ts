import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Growls } from './growls.service';
import AppGrowl from './growl.vue';

@Component({
	components: {
		AppGrowl,
	},
})
export default class AppGrowls extends Vue {
	readonly Growls = Growls;
}
