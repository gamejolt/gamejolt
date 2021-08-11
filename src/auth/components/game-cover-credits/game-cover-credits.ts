import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { number } from '../../../_common/filters/number';
import AppGameThumbnailImg from '../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Store } from '../../store/index';

@Options({
	components: {
		AppGameThumbnailImg,
	},
})
export default class AppGameCoverCredits extends Vue {
	@State coverGame: Store['coverGame'];

	readonly number = number;
}
