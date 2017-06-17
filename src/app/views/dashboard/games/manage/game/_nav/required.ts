import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./required.html?style=./required.styl';

import { AppJolticon } from '../../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../../../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTooltip,
	},
})
export class AppManageGameNavRequired extends Vue {
	@Prop(Boolean) isComplete?: boolean;
}
