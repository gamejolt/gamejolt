<script lang="ts">
import { addWeeks, startOfDay, startOfTomorrow } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Watch, mixins } from 'vue-property-decorator';
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
import { GameModel } from '../../../../../_common/game/game.model';
import {
	GamePackageModel,
	GamePackageVisibility,
} from '../../../../../_common/game/package/package.model';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import {
	SellablePricingModel,
	getOriginalSellablePricing,
	getPromotionalSellablePricing,
} from '../../../../../_common/sellable/pricing/pricing.model';
import { SellableModel, SellableType } from '../../../../../_common/sellable/sellable.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import { Timezone, TimezoneData } from '../../../../../_common/timezone/timezone.service';
import { AppGamePerms } from '../../../game/perms/perms';

type FormGamePackageModel = GamePackageModel & {
	primary: boolean;
	pricing_type: SellableModel['type'];
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
	game!: GameModel;

	@Prop(Object)
	sellable!: SellableModel;

	modelClass = GamePackageModel as any;

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
	pricings: SellablePricingModel[] = [];
	originalPricing: SellablePricingModel | null = null;
	promotionalPricing: SellablePricingModel | null = null;
	timezones: { [region: string]: (TimezoneData & { label?: string })[] } = {};

	readonly GamePackage = GamePackageModel;
	readonly formatDate = formatDate;
	readonly formatCurrency = formatCurrency;
	readonly GamePackageVisibilityPublic = GamePackageVisibility.Public;
	readonly GamePackageVisibilityPrivate = GamePackageVisibility.Private;

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
		this.pricings = SellablePricingModel.populate(payload.pricings);
		this.originalPricing = null;
		this.promotionalPricing = null;

		// If there is no primary sellable yet, let's mark this as the primary sellable.
		// This will only be used if they set the pricing type to something other than free.
		this.setField('primary', false);
		if (!this.hasPrimarySellable) {
			this.setField('primary', true);
		}

		this.setField('pricing_type', SellableType.Free);
		this.setField('sale_start', startOfTomorrow().getTime());
		this.setField('sale_end', startOfDay(addWeeks(Date.now(), 1)).getTime());

		if (this.method === 'add') {
			this.setField('visibility', GamePackageVisibility.Public);
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

				this.originalPricing = getOriginalSellablePricing(this.pricings) || null;
				this.promotionalPricing = getPromotionalSellablePricing(this.pricings) || null;

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
		const result = await showModalConfirm(
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
	<AppForm :controller="form">
		<AppLoadingFade :is-loading="isProcessing">
			<AppFormGroup name="title" :label="$gettext(`Package Name`)">
				<p class="help-block">
					<AppTranslate>
						This is the name that shows up on your game page above the Download/Play
						button. For your main package, use the title of your game.
					</AppTranslate>
				</p>

				<AppFormControl
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

				<AppFormControlErrors />
			</AppFormGroup>

			<AppFormGroup
				name="description"
				:label="$gettext(`Package Description`)"
				:optional="true"
			>
				<p v-translate class="help-block">
					This should be filled in
					<em>only if it's needed</em>
					, if the name alone isn't enough to distinguish this package from other
					packages.
				</p>

				<div v-if="!showDescriptionInput">
					<AppButton :disabled="!hasBuildsPerms" @click="showDescriptionInput = true">
						<AppTranslate>Enter Description</AppTranslate>
					</AppButton>
				</div>
				<div v-else>
					<AppFormControlTextarea
						rows="2"
						:validators="[validateMaxLength(750)]"
						:disabled="!hasBuildsPerms"
					/>
					<AppFormControlErrors />
				</div>
			</AppFormGroup>

			<AppFormGroup name="visibility" :label="$gettext(`Visibility`)">
				<div class="radio" :class="{ disabled: !hasAllPerms }">
					<label>
						<AppFormControlRadio
							:value="GamePackageVisibilityPublic"
							:disabled="!hasAllPerms"
						/>
						<AppTranslate>Public</AppTranslate>
						&mdash;
						<span class="help-inline">
							<AppTranslate>Anyone can access this package.</AppTranslate>
						</span>
					</label>
				</div>

				<div class="radio" :class="{ disabled: !hasAllPerms }">
					<label>
						<AppFormControlRadio
							:value="GamePackageVisibilityPrivate"
							:disabled="!hasAllPerms"
						/>
						<AppTranslate>Private</AppTranslate>
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
					<AppTranslate>
						Note that regardless of this setting, your package will only be visible on
						your game's page if it has published releases in it.
					</AppTranslate>
				</div>
			</AppFormGroup>

			<AppFormGroup
				v-if="game.referrals_enabled"
				name="partner_visibility"
				:label="$gettext(`Partner Visibility`)"
			>
				<template #inline-control>
					<AppFormControlToggle :disabled="!hasSalesPerms" />
				</template>

				<p class="help-block">
					<AppTranslate>
						Enabling this will allow partners to access this package even if it's marked
						as Private or your game is a Devlog-only project.
					</AppTranslate>
					{{ ' ' }}
					<router-link
						:to="{ name: 'landing.partners' }"
						class="link-help"
						target="_blank"
					>
						<AppTranslate>What is a Game Jolt Partner?</AppTranslate>
					</router-link>
				</p>
			</AppFormGroup>

			<AppFormGroup name="pricing_type" :label="$gettext(`Pricing Type`)">
				<div v-if="isFangame" class="alert alert-notice">
					<AppTranslate>
						Accepting payments for fangames is illegal and against our terms. If you
						sell fangames, we will remove your account and block you from the
						Marketplace.
					</AppTranslate>
				</div>
				<div v-else>
					<p v-if="!isUserVerified" class="help-block">
						<AppJolticon icon="notice" />
						<template v-if="user && game.developer.id === user.id">
							<AppTranslate>
								You must set up your financial information before you can start
								accepting money.
							</AppTranslate>
							{{ ' ' }}
							<router-link :to="{ name: 'dash.account.financials' }">
								<AppTranslate>Go to financial set up.</AppTranslate>
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
						<AppTranslate>
							Packages with browser builds cannot be sold at this time.
						</AppTranslate>
					</div>
				</div>

				<div class="radio" :class="{ disabled: !hasSalesPerms }">
					<label>
						<AppFormControlRadio value="free" :disabled="!hasSalesPerms" />
						<AppTranslate>Free</AppTranslate>
						&mdash;
						<span class="help-inline">
							<AppTranslate>
								Completely free with no option to pay at all.
							</AppTranslate>
						</span>
					</label>
				</div>

				<div
					class="radio"
					:class="{ disabled: !isUserVerified || isFangame || !hasSalesPerms }"
				>
					<label>
						<AppFormControlRadio
							value="pwyw"
							:disabled="!isUserVerified || isFangame || !hasSalesPerms"
						/>

						<AppTranslate>Pay What You Want</AppTranslate>
						&mdash;
						<span class="help-inline">
							<AppTranslate>
								They will be able to pay $0 or more. They set the price.
							</AppTranslate>
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
						<AppFormControlRadio
							value="paid"
							:disabled="
								!isUserVerified ||
								(model && model.has_browser_builds) ||
								isFangame ||
								!hasSalesPerms
							"
						/>
						<AppTranslate>Paid</AppTranslate>
						&mdash;
						<span class="help-inline">
							<AppTranslate>
								Charge a specific price with the ability for them to pay more.
							</AppTranslate>
						</span>
					</label>
				</div>
			</AppFormGroup>

			<AppFormGroup
				v-if="formModel.pricing_type === 'pwyw'"
				name="price"
				:label="$gettext(`Suggested Price`)"
				:optional="true"
			>
				<div class="row">
					<div class="col-sm-3">
						<AppFormGroup name="has_suggested_price" hide-label>
							<AppFormControlToggle :disabled="!hasSalesPerms" />
						</AppFormGroup>
						<br class="visible-xs" />
					</div>
					<div class="col-sm-9">
						<div class="input-group">
							<span class="input-group-addon">$</span>
							<AppFormControl
								type="currency"
								step="1"
								:validators="[validateMinValue(minPrice / 100)]"
								:disabled="!formModel.has_suggested_price || !hasSalesPerms"
							/>
						</div>
						<AppFormControlErrors />
					</div>
				</div>
			</AppFormGroup>

			<AppFormGroup
				v-if="formModel.pricing_type === 'paid'"
				name="price"
				:label="$gettext(`Price`)"
			>
				<div class="input-group">
					<span class="input-group-addon">$</span>
					<AppFormControl
						type="currency"
						step="1"
						:validators="[validateMinValue(minPrice / 100)]"
						:disabled="!hasSalesPerms"
					/>
				</div>
				<AppFormControlErrors />
			</AppFormGroup>

			<div v-if="formModel.pricing_type === 'paid'">
				<AppGamePerms
					v-if="!promotionalPricing && !isShowingSaleForm"
					tag="div"
					required="sales"
				>
					<div>
						<AppButton @click="isShowingSaleForm = true">
							<AppTranslate>Set Up Sale</AppTranslate>
						</AppButton>
					</div>
					<br />
				</AppGamePerms>
				<div v-else-if="isShowingSaleForm" class="well fill-offset full-bleed">
					<fieldset>
						<AppFormLegend compact>
							<AppTranslate>Set up sale</AppTranslate>
						</AppFormLegend>

						<AppFormGroup name="sale_timezone" :label="$gettext(`Timezone`)">
							<p class="help-block">
								<AppTranslate>
									All time selection below will use this timezone.
								</AppTranslate>
							</p>

							<p class="help-block">
								<strong>
									<AppTranslate>
										Should auto-detect, but if it doesn't, choose your closest
										city.
									</AppTranslate>
								</strong>
							</p>

							<AppFormControlSelect>
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
							</AppFormControlSelect>

							<AppFormControlErrors />
						</AppFormGroup>

						<div class="form-group">
							<label class="control-label">
								<AppTranslate>Start</AppTranslate>
							</label>

							<!--
								Can only set this when first setting up a sale.
							-->
							<AppFormGroup
								v-if="!promotionalPricing"
								name="sale_start_now"
								:hide-label="true"
							>
								<div class="checkbox">
									<label>
										<AppFormControlCheckbox />
										<AppTranslate>Start immediately?</AppTranslate>
									</label>
								</div>
							</AppFormGroup>

							<AppFormGroup
								v-if="!formModel.sale_start_now || promotionalPricing"
								name="sale_start"
								:hide-label="true"
							>
								<AppFormControlDate
									:timezone-offset="saleTimezoneOffset"
									:min-date="now"
								/>
								<AppFormControlErrors :label="$gettext(`start time`)" />
							</AppFormGroup>
						</div>

						<AppFormGroup name="sale_end" :label="$gettext(`End`)">
							<AppFormControlDate
								:timezone-offset="saleTimezoneOffset"
								:min-date="formModel.sale_start"
							/>
							<AppFormControlErrors :label="$gettext(`end time`)" />
						</AppFormGroup>

						<AppFormGroup name="sale_price" :label="$gettext(`Sale Price`)">
							<div class="input-group">
								<span class="input-group-addon">$</span>
								<AppFormControl
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

							<AppFormControlErrors />
						</AppFormGroup>
					</fieldset>
				</div>
				<div v-else-if="promotionalPricing" class="well fill-offset full-bleed">
					<div v-if="promotionalPricing.start > now" class="alert">
						<AppTranslate>A sale is currently scheduled.</AppTranslate>
					</div>
					<div v-else class="alert alert-highlight">
						<AppTranslate>Your sale is currently running.</AppTranslate>
					</div>

					<table class="table sans-margin-bottom">
						<colgroup>
							<col class="col-xs-4 col-sm-4 col-md-3" />
						</colgroup>
						<tr>
							<th><AppTranslate>Timezone</AppTranslate></th>
							<td>
								{{ promotionalPricing.timezone }}
								<div class="text-muted small">
									<AppTranslate>
										All times are based off this timezone.
									</AppTranslate>
								</div>
							</td>
						</tr>
						<tr>
							<th><AppTranslate>Start</AppTranslate></th>
							<td>
								{{ formatDate(saleStartLocal, 'medium') }}
								<AppTimeAgo
									:date="promotionalPricing.start"
									is-future
									class="text-muted small"
								/>
							</td>
						</tr>
						<tr>
							<th><AppTranslate>End</AppTranslate></th>
							<td>
								{{ formatDate(saleEndLocal, 'medium') }}
								<AppTimeAgo
									:date="promotionalPricing.end"
									is-future
									class="text-muted small"
								/>
							</td>
						</tr>
						<tr>
							<th><AppTranslate>Price</AppTranslate></th>
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

					<AppGamePerms tag="div" required="sales">
						<AppButton v-if="!isShowingSaleForm" @click="isShowingSaleForm = true">
							<AppTranslate>Edit Sale</AppTranslate>
						</AppButton>
						<AppButton trans @click="cancelSale()">
							<AppTranslate>Cancel Sale</AppTranslate>
						</AppButton>
					</AppGamePerms>
				</div>
			</div>

			<AppFormGroup
				name="primary"
				:label="$gettext(`Primary Package`)"
				:optional="!startedPrimary && hasPrimarySellable"
			>
				<p class="help-block">
					<AppTranslate>
						We use the primary package to determine the price to show on game listings.
						You can only have one primary package for your game.
					</AppTranslate>
				</p>
				<div class="checkbox">
					<label>
						<AppFormControlCheckbox :disabled="startedPrimary || !hasPrimarySellable" />

						<template v-if="!hasPrimarySellable">
							<strong>
								<AppTranslate>
									Since you don't have any packages yet, we'll mark this as your
									primary one.
								</AppTranslate>
							</strong>
						</template>
						<template v-else>
							<template v-if="!startedPrimary">
								<AppTranslate>Make this package the primary package</AppTranslate>
							</template>
							<strong v-else>
								<AppTranslate>This is currently the primary package</AppTranslate>
							</strong>
						</template>
					</label>
				</div>
			</AppFormGroup>

			<AppFormButton>
				<AppTranslate v-if="method === 'add'">Add Package</AppTranslate>
				<AppTranslate v-else-if="method === 'edit'">Save Package</AppTranslate>
			</AppFormButton>
		</AppLoadingFade>
	</AppForm>
</template>
