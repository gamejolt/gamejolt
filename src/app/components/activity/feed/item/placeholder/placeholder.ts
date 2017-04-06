import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html?style=./placeholder.styl';

import { AppButtonPlaceholder } from '../../../../../../lib/gj-lib-client/components/button/placeholder/placeholder';

@View
@Component({
	components: {
		AppButtonPlaceholder,
	},
})
export class AppActivityFeedItemPlaceholder extends Vue
{
}
