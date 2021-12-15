import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import {
	AppPromotionSource,
	AppPromotionStore,
	AppPromotionStoreKey,
} from '../../utils/mobile-app';
import { trackAppPromotionClick } from '../analytics/analytics.service';

@Component({})
export default class AppAppButtons extends Vue {
	@Prop({ type: String, required: true })
	source!: AppPromotionSource;

	@Prop({ type: Boolean })
	justified!: boolean;

	@Inject(AppPromotionStoreKey)
	appPromotion!: AppPromotionStore;

	readonly trackAppPromotionClick = trackAppPromotionClick;
}
