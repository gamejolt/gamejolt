<script lang="ts">
import { addWeeks, startOfDay, startOfTomorrow } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { setup } from 'vue-class-component';
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { formatDate } from '../../../../../_common/filters/date';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlToggle from '../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import {
	BaseForm,
	FormOnBeforeSubmit,
	FormOnLoad,
} from '../../../../../_common/form-vue/form.service';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { SellablePricing } from '../../../../../_common/sellable/pricing/pricing.model';
import { Sellable } from '../../../../../_common/sellable/sellable.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
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

class Wrapper extends BaseForm<FormGamePackageModel> {}

@Options({
	components: {
		AppFormLegend,
		AppLoadingFade,
		AppFormControlToggle,
		AppFormControlDate,
		AppGamePerms,
		AppTimeAgo,
	},
})
export default class FormGamePackage
	extends mixins(Wrapper)
	implements FormOnLoad, FormOnBeforeSubmit
{
	@Prop(Object)
	game!: Game;

	@Prop(Object)
	sellable!: Sellable;

	modelClass = GamePackage as any;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

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

	readonly GamePackage = GamePackage;
	readonly formatDate = formatDate;
	readonly formatCurrency = formatCurrency;

	@Emit('salecancel')
	emitSaleCancel(_formModel: FormGamePackageModel) {}

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

	created() {
		this.form.reloadOnSubmit = true;
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

		this.emitSaleCancel(this.formModel);
	}
}
</script>

<template>
	<app-form :controller="form">
		<app-loading-fade :is-loading="isProcessing">
			<app-form-group name="title" :label="$gettext(`dash.games.packages.form.title_label`)">
				<p class="help-block">
					<translate>
						This is the name that shows up on your game page above the Download/Play
						button. For your main package, use the title of your game.
					</translate>
				</p>

				<app-form-control
					max="150"
					:validators="[
						validateMaxLength(150),
						validateAvailability({
							url: `/web/dash/developer/games/packages/check-field-availability/${game.id}/title`,
							initVal: method === 'edit' ? model.title || game.title : undefined,
						}),
					]"
					:validate-delay="500"
					:disabled="!hasBuildsPerms"
				/>

				<app-form-control-errors />
			</app-form-group>

			<app-form-group
				name="description"
				:label="$gettext(`dash.games.packages.form.description_label`)"
				:optional="true"
			>
				<p v-translate class="help-block">
					This should be filled in
					<em>only if it's needed</em>
					, if the name alone isn't enough to distinguish this package from other
					packages.
				</p>

				<div v-if="!showDescriptionInput">
					<app-button :disabled="!hasBuildsPerms" @click="showDescriptionInput = true">
						<translate>dash.games.packages.form.description_change_button</translate>
					</app-button>
				</div>
				<div v-else>
					<app-form-control-textarea
						rows="2"
						:validators="[validateMaxLength(750)]"
						:disabled="!hasBuildsPerms"
					/>
					<app-form-control-errors />
				</div>
			</app-form-group>

			<app-form-group name="visibility" :label="$gettext(`Visibility`)">
				<div class="radio" :class="{ disabled: !hasAllPerms }">
					<label>
						<app-form-control-radio
							:value="GamePackage.VISIBILITY_PUBLIC"
							:disabled="!hasAllPerms"
						/>
						<translate>Public</translate>
						&mdash;
						<span class="help-inline">
							<translate>Anyone can access this package.</translate>
						</span>
					</label>
				</div>

				<div class="radio" :class="{ disabled: !hasAllPerms }">
					<label>
						<app-form-control-radio
							:value="GamePackage.VISIBILITY_PRIVATE"
							:disabled="!hasAllPerms"
						/>
						<translate>Private</translate>
						&mdash;
						<span v-translate class="help-inline">
							Only you can access this package, as well as any keys you assign. You
							can assign keys in your
							<b>Keys/Access</b>
							page.
						</span>
					</label>
				</div>

				<div class="alert">
					<translate>
						Note that regardless of this setting, your package will only be visible on
						your game's page if it has published releases in it.
					</translate>
				</div>
			</app-form-group>

			<app-form-group
				v-if="game.referrals_enabled"
				name="partner_visibility"
				:label="$gettext(`Partner Visibility`)"
			>
				<app-form-control-toggle class="pull-right" :disabled="!hasSalesPerms" />
				<p class="help-block">
					<translate>
						Enabling this will allow partners to access this package even if it's marked
						as Private or your game is a Devlog-only project.
					</translate>
					{{ ' ' }}
					<router-link
						:to="{ name: 'landing.partners' }"
						class="link-help"
						target="_blank"
					>
						<translate>What is a Game Jolt Partner?</translate>
					</router-link>
				</p>
			</app-form-group>

			<app-form-group name="pricing_type" :label="$gettext(`Pricing Type`)">
				<div v-if="isFangame" class="alert alert-notice">
					<translate>
						Accepting payments for fangames is illegal and against our terms. If you
						sell fangames, we will remove your account and block you from the
						Marketplace.
					</translate>
				</div>
				<div v-else>
					<p v-if="!isUserVerified" class="help-block">
						<app-jolticon icon="notice" />
						<template v-if="user && game.developer.id === user.id">
							<translate>
								You must set up your financial information before you can start
								accepting money.
							</translate>
							{{ ' ' }}
							<router-link :to="{ name: 'dash.account.financials' }">
								<translate>Go to financial set up.</translate>
							</router-link>
						</template>
						<span
							v-else
							v-translate="{
								username: game.developer.username,
							}"
						>
							@%{ username } needs to set their financial information before the game
							can start accepting money.
						</span>
					</p>

					<div
						v-if="isUserVerified && model && model.has_browser_builds"
						class="alert alert-notice"
					>
						<translate>
							Packages with browser builds cannot be sold at this time.
						</translate>
					</div>
				</div>

				<div class="radio" :class="{ disabled: !hasSalesPerms }">
					<label>
						<app-form-control-radio value="free" :disabled="!hasSalesPerms" />
						<translate>Free</translate>
						&mdash;
						<span class="help-inline">
							<translate>Completely free with no option to pay at all.</translate>
						</span>
					</label>
				</div>

				<div
					class="radio"
					:class="{ disabled: !isUserVerified || isFangame || !hasSalesPerms }"
				>
					<label>
						<app-form-control-radio
							value="pwyw"
							:disabled="!isUserVerified || isFangame || !hasSalesPerms"
						/>

						<translate>Pay What You Want</translate>
						&mdash;
						<span class="help-inline">
							<translate>
								They will be able to pay $0 or more. They set the price.
							</translate>
						</span>
					</label>
				</div>

				<div
					class="radio"
					:class="{
						disabled:
							!isUserVerified ||
							(model && model.has_browser_builds) ||
							isFangame ||
							!hasSalesPerms,
					}"
				>
					<label>
						<app-form-control-radio
							value="paid"
							:disabled="
								!isUserVerified ||
								(model && model.has_browser_builds) ||
								isFangame ||
								!hasSalesPerms
							"
						/>
						<translate>Paid</translate>
						&mdash;
						<span class="help-inline">
							<translate>
								Charge a specific price with the ability for them to pay more.
							</translate>
						</span>
					</label>
				</div>
			</app-form-group>

			<app-form-group
				v-if="formModel.pricing_type === 'pwyw'"
				name="price"
				:label="$gettext(`Suggested Price`)"
				:optional="true"
			>
				<div class="row">
					<div class="col-sm-3">
						<app-form-group name="has_suggested_price" :hide-label="true">
							<app-form-control-toggle :disabled="!hasSalesPerms" />
						</app-form-group>
						<br class="visible-xs" />
					</div>
					<div class="col-sm-9">
						<div class="input-group">
							<span class="input-group-addon">$</span>
							<app-form-control
								type="currency"
								step="1"
								:validators="[validateMinValue(minPrice / 100)]"
								:disabled="!formModel.has_suggested_price || !hasSalesPerms"
							/>
						</div>
						<app-form-control-errors />
					</div>
				</div>
			</app-form-group>

			<app-form-group
				v-if="formModel.pricing_type === 'paid'"
				name="price"
				:label="$gettext(`Price`)"
			>
				<div class="input-group">
					<span class="input-group-addon">$</span>
					<app-form-control
						type="currency"
						step="1"
						:validators="[validateMinValue(minPrice / 100)]"
						:disabled="!hasSalesPerms"
					/>
				</div>
				<app-form-control-errors />
			</app-form-group>

			<div v-if="formModel.pricing_type === 'paid'">
				<app-game-perms
					v-if="!promotionalPricing && !isShowingSaleForm"
					tag="div"
					required="sales"
				>
					<div>
						<app-button @click="isShowingSaleForm = true">
							<translate>Set Up Sale</translate>
						</app-button>
					</div>
					<br />
				</app-game-perms>
				<div v-else-if="isShowingSaleForm" class="well fill-offset full-bleed">
					<fieldset>
						<app-form-legend compact>
							<translate>Set up sale</translate>
						</app-form-legend>

						<app-form-group name="sale_timezone" :label="$gettext(`Timezone`)">
							<p class="help-block">
								<translate>
									All time selection below will use this timezone.
								</translate>
							</p>

							<p class="help-block">
								<strong>
									<translate>
										Should auto-detect, but if it doesn't, choose your closest
										city.
									</translate>
								</strong>
							</p>

							<app-form-control-select>
								<optgroup
									v-for="(timezones, region) in timezones"
									:key="region"
									:label="region"
								>
									<option
										v-for="timezone in timezones"
										:key="timezone.label"
										:value="timezone.i"
									>
										{{ timezone.label }}
									</option>
								</optgroup>
							</app-form-control-select>

							<app-form-control-errors />
						</app-form-group>

						<div class="form-group">
							<label class="control-label">
								<translate>Start</translate>
							</label>

							<!--
								Can only set this when first setting up a sale.
							-->
							<app-form-group
								v-if="!promotionalPricing"
								name="sale_start_now"
								:hide-label="true"
							>
								<div class="checkbox">
									<label>
										<app-form-control-checkbox />
										<translate>Start immediately?</translate>
									</label>
								</div>
							</app-form-group>

							<app-form-group
								v-if="!formModel.sale_start_now || promotionalPricing"
								name="sale_start"
								:hide-label="true"
							>
								<app-form-control-date
									:timezone-offset="saleTimezoneOffset"
									:min-date="now"
								/>
								<app-form-control-errors :label="$gettext(`start time`)" />
							</app-form-group>
						</div>

						<app-form-group name="sale_end" :label="$gettext(`End`)">
							<app-form-control-date
								:timezone-offset="saleTimezoneOffset"
								:min-date="formModel.sale_start"
							/>
							<app-form-control-errors :label="$gettext(`end time`)" />
						</app-form-group>

						<app-form-group name="sale_price" :label="$gettext(`Sale Price`)">
							<div class="input-group">
								<span class="input-group-addon">$</span>
								<app-form-control
									type="currency"
									step="1"
									:validators="[
										validateMinValue(minPrice / 100),
										validateMaxValue(formModel.price - 0.01),
									]"
								/>
							</div>

							<p v-if="formModel.price && formModel.sale_price" class="help-block">
								{{
									(
										((formModel.price - formModel.sale_price) /
											formModel.price) *
										100
									).toFixed(0)
								}}% off
							</p>

							<app-form-control-errors />
						</app-form-group>
					</fieldset>
				</div>
				<div v-else-if="promotionalPricing" class="well fill-offset full-bleed">
					<div v-if="promotionalPricing.start > now" class="alert">
						<translate>A sale is currently scheduled.</translate>
					</div>
					<div v-else class="alert alert-highlight">
						<translate>Your sale is currently running.</translate>
					</div>

					<table class="table sans-margin-bottom">
						<colgroup>
							<col class="col-xs-4 col-sm-4 col-md-3" />
						</colgroup>
						<tr>
							<th><translate>Timezone</translate></th>
							<td>
								{{ promotionalPricing.timezone }}
								<div class="text-muted small">
									<translate>All times are based off this timezone.</translate>
								</div>
							</td>
						</tr>
						<tr>
							<th><translate>Start</translate></th>
							<td>
								{{ formatDate(saleStartLocal, 'medium') }}
								<app-time-ago
									:date="promotionalPricing.start"
									is-future
									class="text-muted small"
								/>
							</td>
						</tr>
						<tr>
							<th><translate>End</translate></th>
							<td>
								{{ formatDate(saleEndLocal, 'medium') }}
								<app-time-ago
									:date="promotionalPricing.end"
									is-future
									class="text-muted small"
								/>
							</td>
						</tr>
						<tr>
							<th><translate>Price</translate></th>
							<td>
								{{ formatCurrency(promotionalPricing.amount) }}
								<small class="text-muted">
									{{
										(
											((originalPricing.amount - promotionalPricing.amount) /
												originalPricing.amount) *
											100
										).toFixed(0)
									}}% off
								</small>
							</td>
						</tr>
					</table>

					<br />

					<app-game-perms tag="div" required="sales">
						<app-button v-if="!isShowingSaleForm" @click="isShowingSaleForm = true">
							<translate>Edit Sale</translate>
						</app-button>
						<app-button trans @click="cancelSale()">
							<translate>Cancel Sale</translate>
						</app-button>
					</app-game-perms>
				</div>
			</div>

			<app-form-group
				name="primary"
				:label="$gettext(`Primary Package`)"
				:optional="!startedPrimary && hasPrimarySellable"
			>
				<p class="help-block">
					<translate>
						We use the primary package to determine the price to show on game listings.
						You can only have one primary package for your game.
					</translate>
				</p>
				<div class="checkbox">
					<label>
						<app-form-control-checkbox
							:disabled="startedPrimary || !hasPrimarySellable"
						/>

						<template v-if="!hasPrimarySellable">
							<strong>
								<translate>
									Since you don't have any packages yet, we'll mark this as your
									primary one.
								</translate>
							</strong>
						</template>
						<template v-else>
							<template v-if="!startedPrimary">
								<translate>Make this package the primary package</translate>
							</template>
							<strong v-else>
								<translate>This is currently the primary package</translate>
							</strong>
						</template>
					</label>
				</div>
			</app-form-group>

			<app-form-button>
				<translate v-if="method === 'add'">
					dash.games.packages.form.add_package_button
				</translate>
				<translate v-else-if="method === 'edit'">Save Package</translate>
			</app-form-button>
		</app-loading-fade>
	</app-form>
</template>
