import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../../store/index';
import { GameCollection } from '../../collection.model';
import AppGameCollectionThumbnail from '../../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppGameCollectionThumbnail,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppGameCollectionGridItem extends Vue {
	@Prop(GameCollection) collection!: GameCollection;
	@Prop(String) eventLabel?: string;

	@State app!: Store['app'];

	get notOwner() {
		return this.collection.from_subscription || !this.collection.isOwner;
	}
}
