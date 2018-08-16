import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./grid.html';

import { GameCollection } from '../collection.model';
import { AppGameCollectionGridItem } from './item/item';

@View
@Component({
	components: {
		AppGameCollectionGridItem,
	},
})
export class AppGameCollectionGrid extends Vue {
	@Prop(Array) collections!: GameCollection[];
	@Prop(String) eventLabel?: string;
}
