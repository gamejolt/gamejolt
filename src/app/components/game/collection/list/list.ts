import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./list.html?style=./list.styl';

import { GameCollection } from '../collection.model';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppGameCollectionThumbnail } from '../thumbnail/thumbnail';
import { Store } from '../../../../store/index';

@View
@Component({
	components: {
		AppGameCollectionThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameCollectionList extends Vue {
	@Prop(Array) collections: GameCollection[];
	@Prop(String) eventLabel?: string;

	@State app: Store['app'];
}
