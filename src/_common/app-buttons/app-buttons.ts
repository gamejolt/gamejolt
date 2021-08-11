import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import {
	AppPromotionSource,
	AppPromotionStore,
	AppPromotionStoreKey,
} from '../../utils/mobile-app';
import { propRequired } from '../../utils/vue';
import { trackAppPromotionClick } from '../analytics/analytics.service';

@Options({})
export default class AppAppButtons extends Vue {
	@Prop(propRequired(String)) source!: AppPromotionSource;

	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	readonly trackAppPromotionClick = trackAppPromotionClick;
}
