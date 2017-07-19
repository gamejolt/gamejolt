// var moment = require('moment-timezone');

import { Component, Prop, Watch } from 'vue-property-decorator';
import { determine } from 'jstimezonedetect';
import * as View from '!view!./package.html';

import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { GamePackage } from '../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';
import { Sellable } from '../../../../../lib/gj-lib-client/components/sellable/sellable.model';
import { SellablePricing } from '../../../../../lib/gj-lib-client/components/sellable/pricing/pricing.model';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppFormControlToggle } from '../../../../../lib/gj-lib-client/components/form-vue/control/toggle/toggle';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoadingFade } from '../../../../../lib/gj-lib-client/components/loading/fade/fade';
import { AppTimepicker } from '../../../../../lib/gj-lib-client/components/timepicker/timepicker';

type FormGamePackageModel = GamePackage & {
	primary: boolean;
	pricing_type: Sellable['type'];
	price: number | null;
	sale_timezone: string;
	sale_start: number | null;
	sale_end: number | null;
	sale_price: number | null;
	has_suggested_price: boolean;
};

@View
@Component({
	components: {
		AppJolticon,
		AppFormControlToggle,
		AppLoadingFade,
	},
})
export class FormGamePackage extends BaseForm<FormGamePackageModel>
	implements FormOnInit, FormOnLoad {
	modelClass = GamePackage as any;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@Prop(Game) game: Game;
	@Prop(Sellable) sellable: Sellable;
	// @Prop(GamePackage) package?: GamePackage;

	showDescriptionInput = false;
	isShowingSaleForm = false;
	now = 0;
	isProcessing = false;
	startedPrimary = false;
	hasPrimarySellable = false;
	minPrice = 0;
	isUserVerified = false;
	isFangame = false;
	pricings: SellablePricing[] = [];
	originalPricing: SellablePricing | null = null;
	promotionalPricing: SellablePricing | null = null;

	GamePackage = GamePackage;

	get loadUrl() {
		const params = [this.formModel.game_id];
		if (this.method === 'edit') {
			params.push(this.formModel.id);
		}

		return '/web/dash/developer/games/packages/save/' + params.join('/');
	}

	@Watch('formModel.has_suggested_price')
	onSuggestedPriceToggle(state: boolean) {
		// Just null out the price field if they toggle off suggested price.
		if (this.formModel.pricing_type === 'pwyw' && !state) {
			this.setField('price', null);
		}
	}

	onInit() {
		this.setField('game_id', this.game.id);

		this.showDescriptionInput = this.formModel.description ? true : false;
		this.isShowingSaleForm = false;
		this.now = Date.now();

		// Auto-detect timezone.
		this.setField('sale_timezone', determine().name());

		// // Get timezones list.
		// this.timezones = [];
		// Timezone.getTimezones().then(function(timezones) {
		// 	this.timezones = timezones;

		// 	this.timezones.forEach(function(tz) {
		// 		var offset = tz.o / 3600;
		// 		if (offset > 0) {
		// 			offset = '+' + offset + ':00';
		// 		} else if (offset === 0) {
		// 			offset = '';
		// 		}
		// 		tz.label = '(UTC' + offset + ') ' + tz.i;
		// 	});
		// });

		this.isProcessing = false;
	}

	onLoad(payload: any) {
		this.startedPrimary = !!(this.sellable && this.sellable.primary);
		this.hasPrimarySellable = payload.hasPrimarySellable;
		this.minPrice = payload.minPrice || 50;
		this.isUserVerified = payload.isUserVerified;
		this.isFangame = payload.isFangame;
		this.pricings = SellablePricing.populate(payload.pricings);
		this.originalPricing = null;
		this.promotionalPricing = null;

		// If there is no primary sellable yet, let's mark this as the primary sellable.
		// This will only be used if they set the pricing type to something other than free.
		this.setField('primary', false);
		if (!this.hasPrimarySellable) {
			this.setField('primary', true);
		}

		this.setField('pricing_type', 'free');
		// this.setField('sale_start', moment())
		// 	.add(1, 'day')
		// 	.startOf('day')
		// 	.valueOf();
		// this.setField('sale_end', moment().add(1, 'week').startOf('day').valueOf());

		if (this.method === 'add') {
			this.setField('visibility', GamePackage.VISIBILITY_PUBLIC);
			if (payload.hasDefaultPackage) {
				this.setField('title', '');
			} else {
				this.setField('title', this.game.title);
			}
		} else {
			if (!this.formModel.title) {
				this.setField('title', this.game.title);
			}

			this.setField('primary', this.sellable.primary);

			if (this.sellable.type !== 'free') {
				this.setField('pricing_type', this.sellable.type);

				this.originalPricing = SellablePricing.getOriginalPricing(this.pricings) || null;

				this.promotionalPricing = SellablePricing.getPromotionalPricing(this.pricings) || null;

				this.setField('price', this.originalPricing ? this.originalPricing.amount / 100 : 0);

				if (this.promotionalPricing) {
					this.setField('sale_timezone', this.promotionalPricing.timezone);
					this.setField('sale_start', this.promotionalPricing.start);
					this.setField('sale_end', this.promotionalPricing.end);
					this.setField('sale_price', this.promotionalPricing.amount / 100);

					// this.saleStartLocal = moment(this.promotionalPricing.start).tz(
					// 	this.promotionalPricing.timezone
					// );
					// this.saleEndLocal = moment(this.promotionalPricing.end).tz(
					// 	this.promotionalPricing.timezone
					// );
				}

				this.setField('has_suggested_price', !!this.formModel.price);
			}
		}
	}

	async cancelSale() {
		const result = await ModalConfirm.show(
			this.$gettext('Are you sure you want to cancel this sale?')
		);

		if (!result) {
			return;
		}

		this.isProcessing = true;

		const params = [this.formModel.game_id, this.formModel.id];
		await Api.sendRequest('/web/dash/developer/games/packages/cancel-sales/' + params.join('/'));

		this.promotionalPricing = null;
		this.setField('sale_timezone', determine().name());
		this.setField('sale_start', null);
		this.setField('sale_end', null);
		this.setField('sale_price', null);
		this.isProcessing = false;

		// this.onSubmitSuccess(this, payload);

		this.$emit('salecancel', this.formModel);
	}
}

// angular
// 	.module('App.Forms.Dashboard')
// 	.directive('gjFormDashboardGamePackage', function(
// 		$state,
// 		Form,
// 		App,
// 		Api,
// 		Game_Package,
// 		Sellable,
// 		Sellable_Pricing,
// 		Timezone,
// 		ModalConfirm,
// 		gettextCatalog
// 	) {
// 		var form = new Form({
// 			model: 'Game_Package',
// 			template: require('./package.html'),
// 			resetOnSubmit: true,
// 		});

// 		form.this.game = '=gjGame';
// 		form.this.sellable = '=gjSellable';
// 		form.this.package = '=gjGamePackage';
// 		form.this.saleCanceled = '&saleCanceled';

// 		form.onInit = function(this) {
// 			// Api.sendRequest(
// 			// 	'/web/dash/developer/games/packages/save/' + params.join('/')
// 			// ).then(function(payload) {

// 			// });

// 			// Only do this first load.
// 			if (!this.isLoaded) {

// 				this.$watch('formModel.sale_start_now', function(val) {
// 					// If the form control isn't on the page, then this won't be defined.
// 					// We only want to do this logic if the control is visible (when they first set up sale).
// 					if (typeof val === 'undefined') {
// 						return;
// 					}

// 					if (val) {
// 						this.formModel.sale_start = Date.now();
// 					} else {
// 						this.formModel.sale_start = moment()
// 							.add(1, 'day')
// 							.startOf('day')
// 							.valueOf();
// 					}
// 				});

// 			}
// 		};

// 		form.onSubmitSuccess = function(this, response) {
// 			if (this.sellable) {
// 				this.sellable.assign(response.sellable);
// 			}

// 			if (this.game) {
// 				this.game.assign(response.game);
// 			}
// 		};

// 		return form;
// 	});
