import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { AppPromotionSource } from '../../utils/mobile-app';
import { propRequired } from '../../utils/vue';
import { trackAppPromotionClick } from '../analytics/analytics.service';

@Component({})
export default class AppAppButtons extends Vue {
	@Prop(propRequired(String)) source!: AppPromotionSource;

	readonly trackAppPromotionClick = trackAppPromotionClick;
}
