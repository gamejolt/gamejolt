import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameCollection } from '../collection.model';
import AppGameCollectionGridItem from './item/item.vue';

@Options({
	components: {
		AppGameCollectionGridItem,
	},
})
export default class AppGameCollectionGrid extends Vue {
	@Prop(Array) collections!: GameCollection[];
	@Prop(String) eventLabel?: string;
}
