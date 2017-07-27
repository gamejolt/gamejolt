import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html?style=./placeholder.styl';

import { AppButtonPlaceholder } from '../../../../../../lib/gj-lib-client/components/button/placeholder/placeholder';
import { AppTimelineListItem } from '../../../../../../lib/gj-lib-client/components/timeline-list/item/item';

@View
@Component({
	components: {
		AppTimelineListItem,
		AppButtonPlaceholder,
	},
})
export class AppActivityFeedItemPlaceholder extends Vue {
	@Prop(String) type: string;
	@Prop(Boolean) isNew?: boolean;
	@Prop(Boolean) isActive?: boolean;
}
