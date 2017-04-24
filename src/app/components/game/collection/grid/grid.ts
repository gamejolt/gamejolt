import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./grid.html?style=./grid.styl';

import { GameCollection } from '../collection.model';
import { AppGameCollectionThumbnail } from '../thumbnail/thumbnail';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
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
export class AppGameCollectionGrid extends Vue
{
	@Prop( Array ) collections: GameCollection[];
	@Prop( String ) eventLabel?: string;

	@State app: Store['app'];
}
