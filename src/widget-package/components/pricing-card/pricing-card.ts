import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { currency } from '../../../_common/filters/currency';
import { Store } from '../../store/index';

@Component({})
export default class AppPricingCard extends Vue {
	@State sellable!: Store['sellable'];
	@State price!: NonNullable<Store['price']>;
	@State originalPrice!: NonNullable<Store['originalPrice']>;

	readonly currency = currency;

	get discount() {
		const price = this.price;
		const originalPrice = this.originalPrice;

		return (((originalPrice - price) / originalPrice) * 100).toFixed(0);
	}
}
