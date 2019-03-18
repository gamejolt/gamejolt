import View from '!view!./item.html?style=./item.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppTrackEvent } from '../../../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Store } from '../../../../../store/index';
import { GameCollection } from '../../collection.model';
import { AppGameCollectionThumbnail } from '../../thumbnail/thumbnail';


@View
@Component({
	components: {
		AppGameCollectionThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppGameCollectionGridItem extends Vue {
	@Prop(GameCollection) collection!: GameCollection;
	@Prop(String) eventLabel?: string;

	@State app!: Store['app'];

	get notOwner() {
		return this.collection.from_subscription || !this.collection.isOwner;
	}
}
