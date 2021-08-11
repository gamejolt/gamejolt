import { addWeeks, startOfDay, startOfTomorrow } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { Options, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { currency } from '../../../../../_common/filters/currency';
import { date } from '../../../../../_common/filters/date';
import AppFormControlDate from '../../../../../_common/form-vue/control/date/date.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/control/toggle/toggle.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnInit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import AppFormLegend from '../../../../../_common/form-vue/legend/legend.vue';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import AppLoadingFade from '../../../../../_common/loading/fade/fade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { SellablePricing } from '../../../../../_common/sellable/pricing/pricing.model';
import { Sellable } from '../../../../../_common/sellable/sellable.model';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { Timezone, TimezoneData } from '../../../../../_common/timezone/timezone.service';
import { AppGamePerms } from '../../../game/perms/perms';

type FormGamePackageModel = GamePackage & {
	primary: boolean;
	pricing_type: Sellable['type'];
	price: number | null;
	sale_timezone: string;
	sale_start: number | null;
	sale_end: number | null;
	sale_price: number | null;
	sale_start_now: boolean;
	has_suggested_price: boolean;
};

@Options({
	components: {
		AppFormLegend,
		AppLoadingFade,
		AppFormControlToggle,
		AppFormControlDate,
		AppGamePerms,
		AppTimeAgo,
	},
	filters: {
		date,
		currency,
	},
})
export default class FormGamePackage
	extends BaseForm<FormGamePackageModel>
	implements FormOnInit, FormOnLoad, FormOnBeforeSubmit
{
	modelClass = GamePackage as any;
	resetOnSubmit = true;
	reloadOnSubmit = true;

	@AppState
	user!: AppStore['user'];

	@Prop(Game)
	game!: Game;

	@Prop(Sellable)
	sellable!: Sellable;
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
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = {};

	GamePackage = GamePackage;

	get hasBuildsPerms() {
		return this.game && this.game.hasPerms('builds');
	}

	get hasAllPerms() {
		return this.game && this.game.hasPerms('all');
	}

	get hasSalesPerms() {
		return this.game && this.game.hasPerms('sales');
	}

	get saleTimezoneOffset() {
		if (!this.formModel.sale_timezone) {
			return 0;
		}

		const saleTz = this.timezoneByName(this.formModel.sale_timezone);
		if (!saleTz) {
			console.warn('Could not find timezone offset for: ' + saleTz);
			return 0;
		} else {
			return saleTz.o * 1000;
		}
	}

	get saleStartLocal() {
		if (!this.formModel.sale_start) {
			return null;
		}

		return new Date(this.formModel.sale_start);
	}

	get saleEndLocal() {
		if (!this.formModel.sale_end) {
			return null;
		}

		return new Date(this.formModel.sale_end);
	}

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

	async onInit() {
		this.setField('game_id', this.game.id);

		this.showDescriptionInput = this.formModel.description ? true : false;
		this.isShowingSaleForm = false;
		this.now = Date.now();

		// Auto-detect timezone.
		this.setField('sale_timezone', determine().name());

		// Get timezones list.
		this.timezones = await Timezone.getGroupedTimezones();
		for (let region in this.timezones) {
			for (let tz of this.timezones[region]) {
				let offset = '';
				if (tz.o > 0) {
					offset = `+${tz.o / 3600}:00`;
				} else if (tz.o < 0) {
					offset = `-${-tz.o / 3600}:00`;
				}
				tz.label = `(UTC${offset}) ${tz.i}`;
			}
		}

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
		this.setField('sale_start', startOfTomorrow().getTime());
		this.setField('sale_end', startOfDay(addWeeks(Date.now(), 1)).getTime());

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

				this.promotionalPricing =
					SellablePricing.getPromotionalPricing(this.pricings) || null;

				this.setField(
					'price',
					this.originalPricing ? this.originalPricing.amount / 100 : 0
				);

				if (this.promotionalPricing) {
					this.setField('sale_timezone', this.promotionalPricing.timezone!);
					this.setField('sale_start', this.promotionalPricing.start!);
					this.setField('sale_end', this.promotionalPricing.end!);
					this.setField('sale_price', this.promotionalPricing.amount / 100);
				}

				this.setField('has_suggested_price', !!this.formModel.price);
			}
		}
	}

	onBeforeSubmit(): void {
		if (this.formModel.sale_start_now) {
			this.setField('sale_start', Date.now());
		}
	}

	private timezoneByName(timezone: string) {
		for (let region in this.timezones) {
			const tz = this.timezones[region].find(_tz => _tz.i === timezone);
			if (tz) {
				return tz;
			}
		}
		return null;
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
		await Api.sendRequest(
			'/web/dash/developer/games/packages/cancel-sales/' + params.join('/'),
			{}
		);

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
