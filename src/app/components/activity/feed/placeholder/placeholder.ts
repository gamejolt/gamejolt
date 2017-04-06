import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html';
import '../../../timeline-list/timeline-list.styl';

import { AppButtonPlaceholder } from '../../../../../lib/gj-lib-client/components/button/placeholder/placeholder';
import { AppActivityFeedItemPlaceholder } from '../item/placeholder/placeholder';

@View
@Component({
	components: {
		AppButtonPlaceholder,
		AppActivityFeedItemPlaceholder,
	},
})
export class AppActivityFeedPlaceholder extends Vue
{
}
