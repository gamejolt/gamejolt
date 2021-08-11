import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import {
	AppPromotionSource,
	AppPromotionStore,
	AppPromotionStoreKey,
} from '../../utils/mobile-app';
import { propRequired } from '../../utils/vue';
import { trackAppPromotionClick } from '../analytics/analytics.service';

@Component({})
export default class AppAppButtons extends Vue {
	@Prop(propRequired(String)) source!: AppPromotionSource;

	@Inject({ from: AppPromotionStoreKey })
	appPromotion!: AppPromotionStore;

	readonly trackAppPromotionClick = trackAppPromotionClick;
}
