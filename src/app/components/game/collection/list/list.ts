import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../../store/index';
import { GameCollection } from '../collection.model';
import AppGameCollectionThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppGameCollectionThumbnail,
	},
})
export default class AppGameCollectionList extends Vue {
	@Prop(Array) collections!: GameCollection[];
	@Prop(String) eventLabel?: string;

	@State app!: Store['app'];
}
