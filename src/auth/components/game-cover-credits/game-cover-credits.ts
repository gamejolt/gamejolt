import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../_common/filters/number';
import AppGameThumbnailImg from '../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { useAuthStore } from '../../store/index';

@Options({
	components: {
		AppGameThumbnailImg,
	},
})
export default class AppGameCoverCredits extends Vue {
	store = setup(() => useAuthStore());

	get coverGame() {
		return this.store.coverGame;
	}

	readonly formatNumber = formatNumber;
}
