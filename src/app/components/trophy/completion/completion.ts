import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./completion.html';

import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppProgressBar } from '../../../../lib/gj-lib-client/components/progress/bar/bar';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppProgressBar,
		AppJolticon,
	},
	filters: {
		number,
	},
})
export class AppTrophyCompletion extends Vue
{
	@Prop( Number ) total: number;
	@Prop( Number ) achieved: number;
	@Prop( Number ) experience: number;

	number = number;

	get completionRate()
	{
		return Math.ceil( this.achieved / this.total * 100 );
	}
}
