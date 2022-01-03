import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import {
	AppPromotionSource,
	AppPromotionStore,
	AppPromotionStoreKey,
} from '../../utils/mobile-app';
import { propRequired } from '../../utils/vue';
import { trackAppPromotionClick } from '../analytics/analytics.service';
import appStoreImage from './button-app-store.svg';
import playStoreImage from './button-play-store.png';

@Options({})
export default class AppAppButtons extends Vue {
	@Prop(propRequired(String)) source!: AppPromotionSource;

	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	readonly trackAppPromotionClick = trackAppPromotionClick;
	readonly playStoreImage = playStoreImage;
	readonly appStoreImage = appStoreImage;
}
