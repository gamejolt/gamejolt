import { Options, Prop, Vue } from 'vue-property-decorator';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import { GameCollection } from '../collection.model';

@Options({
	components: {
		AppImgResponsive,
	},
})
export default class AppGameCollectionThumbnail extends Vue {
	@Prop(Object) collection!: GameCollection;
	@Prop(Boolean) hideTag?: boolean;
}
