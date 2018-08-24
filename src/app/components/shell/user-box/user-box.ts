import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./user-box.html?style=./user-box.styl';

import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { Store } from '../../../store/index';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';

@View
@Component({
	components: {
		AppJolticon,
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export class AppShellUserBox extends Vue {
	@State app!: Store['app'];
}
