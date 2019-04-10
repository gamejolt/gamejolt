import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import { GameCollection } from '../collection.model';
import AppGameCollectionGridItem from './item/item.vue'

@Component({
	components: {
		AppGameCollectionGridItem,
	},
})
export default class AppGameCollectionGrid extends Vue {
	@Prop(Array) collections!: GameCollection[];
	@Prop(String) eventLabel?: string;
}
