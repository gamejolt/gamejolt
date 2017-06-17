import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html';
import '../../../../../lib/gj-lib-client/components/timeline-list/timeline-list.styl';

import { AppActivityFeedItemPlaceholder } from '../item/placeholder/placeholder';

@View
@Component({
	components: {
		AppActivityFeedItemPlaceholder,
	},
})
export class AppActivityFeedPlaceholder extends Vue {}
