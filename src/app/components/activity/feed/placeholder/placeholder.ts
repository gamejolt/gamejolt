import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./placeholder.html';

import { AppActivityFeedItemPlaceholder } from '../item/placeholder/placeholder';
import { AppTimelineList } from '../../../../../lib/gj-lib-client/components/timeline-list/timeline-list';

@View
@Component({
	components: {
		AppTimelineList,
		AppActivityFeedItemPlaceholder,
	},
})
export class AppActivityFeedPlaceholder extends Vue {}
