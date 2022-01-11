import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { GameCollection } from '../../collection.model';
import AppGameCollectionThumbnail from '../../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppGameCollectionThumbnail,
	},
})
export default class AppGameCollectionGridItem extends Vue {
	@Prop(Object) collection!: GameCollection;
	@Prop(String) eventLabel?: string;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	get notOwner() {
		return this.collection.from_subscription || !this.collection.isOwner;
	}
}
