<script lang="ts" setup>
import { addWeeks, startOfDay, startOfTomorrow } from 'date-fns';
import { determine } from 'jstimezonedetect';
import { computed, type Ref, ref, toRef, watch } from 'vue';

import AppGamePerms from '~app/components/game/perms/AppGamePerms.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { formatCurrency } from '~common/filters/currency';
import { formatDate } from '~common/filters/date';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormLegend from '~common/form-vue/AppFormLegend.vue';
import AppFormControlCheckbox from '~common/form-vue/controls/AppFormControlCheckbox.vue';
import AppFormControlDate from '~common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import AppFormControlSelect from '~common/form-vue/controls/AppFormControlSelect.vue';
import AppFormControlTextarea from '~common/form-vue/controls/AppFormControlTextarea.vue';
import AppFormControlToggle from '~common/form-vue/controls/AppFormControlToggle.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateMaxValue,
	validateMinValue,
} from '~common/form-vue/validators';
import { GameModel } from '~common/game/game.model';
import {
	$saveGamePackage,
	GamePackageModel,
	GamePackageVisibilityPrivate,
	GamePackageVisibilityPublic,
} from '~common/game/package/package.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLoadingFade from '~common/loading/AppLoadingFade.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import {
	getOriginalSellablePricing,
	getPromotionalSellablePricing,
	SellablePricingModel,
} from '~common/sellable/pricing/pricing.model';
import { SellableModel, SellableTypeFree } from '~common/sellable/sellable.model';
import { useCommonStore } from '~common/store/common-store';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import { Timezone, TimezoneData } from '~common/timezone/timezone.service';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

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

type Props = {
	game: GameModel;
	sellable?: SellableModel;
	model?: GamePackageModel;
};

const props = defineProps<Props>();
const { game, sellable } = props;

const emit = defineEmits<{
	salecancel: [formModel: FormGamePackageModel];
	submit: [formModel: FormGamePackageModel];
}>();

const commonStore = useCommonStore();
const user = commonStore.user;

const showDescriptionInput = ref(false);
const isShowingSaleForm = ref(false);
const now = ref(0);
const isProcessing = ref(false);
const startedPrimary = ref(false);
const hasPrimarySellable = ref(false);
const minPrice = ref(0);
const isUserVerified = ref(false);
const isFangame = ref(false);
const pricings = ref<SellablePricingModel[]>([]);
const originalPricing = ref<SellablePricingModel | null>(null);
const promotionalPricing = ref<SellablePricingModel | null>(null);
const timezones = ref<{ [region: string]: (TimezoneData & { label?: string })[] }>({});
const form: FormController<FormGamePackageModel> = createForm<FormGamePackageModel>({
	model: toRef(props, 'model') as Ref<FormGamePackageModel | undefined>,
	modelClass: GamePackageModel as any,
	modelSaveHandler: $saveGamePackage,
	reloadOnSubmit: true,
	loadUrl: computed(() => {
		const params = [form.formModel.game_id];
		if (form.method === 'edit') {
			params.push(form.formModel.id);
		}
		return '/web/dash/developer/games/packages/save/' + params.join('/');
	}),
	async onInit() {
		form.formModel.game_id = game.id;

		showDescriptionInput.value = form.formModel.description ? true : false;
		isShowingSaleForm.value = false;
		now.value = Date.now();

		// Auto-detect timezone.
		form.formModel.sale_timezone = determine().name();

		// Get timezones list.
		timezones.value = await Timezone.getGroupedTimezones();
		for (let region in timezones.value) {
			for (let tz of timezones.value[region]) {
				let offset = '';
				if (tz.o > 0) {
					offset = `+${tz.o / 3600}:00`;
				} else if (tz.o < 0) {
					offset = `-${-tz.o / 3600}:00`;
				}
				tz.label = `(UTC${offset}) ${tz.i}`;
			}
		}

		isProcessing.value = false;
	},
	onLoad(payload: any) {
		startedPrimary.value = !!(sellable && sellable.primary);
		hasPrimarySellable.value = payload.hasPrimarySellable;
		minPrice.value = payload.minPrice || 50;
		isUserVerified.value = payload.isUserVerified;
		isFangame.value = payload.isFangame;
		pricings.value = SellablePricingModel.populate(payload.pricings);
		originalPricing.value = null;
		promotionalPricing.value = null;

		// If there is no primary sellable yet, let's mark this as the primary sellable.
		form.formModel.primary = false;
		if (!hasPrimarySellable.value) {
			form.formModel.primary = true;
		}

		form.formModel.pricing_type = SellableTypeFree;
		form.formModel.sale_start = startOfTomorrow().getTime();
		form.formModel.sale_end = startOfDay(addWeeks(Date.now(), 1)).getTime();

		if (form.method === 'add') {
			form.formModel.visibility = GamePackageVisibilityPublic;
			if (payload.hasDefaultPackage) {
				form.formModel.title = '';
			} else {
				form.formModel.title = game.title;
			}
		} else {
			if (!form.formModel.title) {
				form.formModel.title = game.title;
			}

			form.formModel.primary = sellable!.primary;

			if (sellable!.type !== SellableTypeFree) {
				form.formModel.pricing_type = sellable!.type;

				originalPricing.value = getOriginalSellablePricing(pricings.value) || null;
				promotionalPricing.value = getPromotionalSellablePricing(pricings.value) || null;

				form.formModel.price = originalPricing.value
					? originalPricing.value.amount / 100
					: 0;

				if (promotionalPricing.value) {
					form.formModel.sale_timezone = promotionalPricing.value.timezone!;
					form.formModel.sale_start = promotionalPricing.value.start!;
					form.formModel.sale_end = promotionalPricing.value.end!;
					form.formModel.sale_price = promotionalPricing.value.amount / 100;
				}

				form.formModel.has_suggested_price = !!form.formModel.price;
			}
		}
	},
	onBeforeSubmit() {
		if (form.formModel.sale_start_now) {
			form.formModel.sale_start = Date.now();
		}
	},
	onSubmitSuccess() {
		emit('submit', form.formModel);
	},
});

const hasBuildsPerms = computed(() => game && game.hasPerms('builds'));
const hasAllPerms = computed(() => game && game.hasPerms('all'));
const hasSalesPerms = computed(() => game && game.hasPerms('sales'));

const saleTimezoneOffset = computed(() => {
	if (!form.formModel.sale_timezone) {
		return 0;
	}
	const saleTz = timezoneByName(form.formModel.sale_timezone);
	if (!saleTz) {
		console.warn('Could not find timezone offset for: ' + saleTz);
		return 0;
	}
	return saleTz.o * 1000;
});

const saleStartLocal = computed(() =>
	form.formModel.sale_start ? new Date(form.formModel.sale_start) : null
);

const saleEndLocal = computed(() =>
	form.formModel.sale_end ? new Date(form.formModel.sale_end) : null
);

watch(
	() => form.formModel.has_suggested_price,
	(state: boolean) => {
		if (form.formModel.pricing_type === 'pwyw' && !state) {
			form.formModel.price = null;
		}
	}
);

function timezoneByName(timezone: string) {
	for (let region in timezones.value) {
		const tz = timezones.value[region].find(_tz => _tz.i === timezone);
		if (tz) {
			return tz;
		}
	}
	return null;
}

async function cancelSale() {
	const result = await showModalConfirm($gettext('Are you sure you want to cancel this sale?'));

	if (!result) {
		return;
	}

	isProcessing.value = true;

	const params = [form.formModel.game_id, form.formModel.id];
	await Api.sendRequest(
		'/web/dash/developer/games/packages/cancel-sales/' + params.join('/'),
		{}
	);

	promotionalPricing.value = null;
	form.formModel.sale_timezone = determine().name();
	form.formModel.sale_start = null;
	form.formModel.sale_end = null;
	form.formModel.sale_price = null;
	isProcessing.value = false;

	emit('salecancel', form.formModel);
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
							initVal:
								form.method === 'edit' ? model?.title || game.title : undefined,
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
						<AppTranslate class="help-inline">
							Only you can access this package, as well as any keys you assign. You
							can assign keys in your Keys/Access page.
						</AppTranslate>
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
				v-if="form.formModel.pricing_type === 'pwyw'"
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
								:disabled="!form.formModel.has_suggested_price || !hasSalesPerms"
							/>
						</div>
						<AppFormControlErrors />
					</div>
				</div>
			</AppFormGroup>

			<AppFormGroup
				v-if="form.formModel.pricing_type === 'paid'"
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

			<div v-if="form.formModel.pricing_type === 'paid'">
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
									v-for="(tzList, region) in timezones"
									:key="region"
									:label="String(region)"
								>
									<option
										v-for="timezone in tzList"
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
								v-if="!form.formModel.sale_start_now || promotionalPricing"
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
								:min-date="form.formModel.sale_start ?? undefined"
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
										validateMaxValue((form.formModel.price ?? 0) - 0.01),
									]"
								/>
							</div>

							<p
								v-if="form.formModel.price && form.formModel.sale_price"
								class="help-block"
							>
								{{
									(
										((form.formModel.price - form.formModel.sale_price) /
											form.formModel.price) *
										100
									).toFixed(0)
								}}% off
							</p>

							<AppFormControlErrors />
						</AppFormGroup>
					</fieldset>
				</div>
				<div v-else-if="promotionalPricing" class="well fill-offset full-bleed">
					<div v-if="promotionalPricing.start! > now" class="alert">
						<AppTranslate>A sale is currently scheduled.</AppTranslate>
					</div>
					<div v-else class="alert alert-highlight">
						<AppTranslate>Your sale is currently running.</AppTranslate>
					</div>

					<table class="table sans-margin-bottom">
						<colgroup>
							<col class="col-xs-4 col-sm-4 col-md-3" />
						</colgroup>
						<tbody>
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
									{{ formatDate(saleStartLocal ?? new Date(), 'medium') }}
									<AppTimeAgo
										:date="promotionalPricing.start ?? 0"
										is-future
										class="text-muted small"
									/>
								</td>
							</tr>
							<tr>
								<th><AppTranslate>End</AppTranslate></th>
								<td>
									{{ formatDate(saleEndLocal ?? new Date(), 'medium') }}
									<AppTimeAgo
										:date="promotionalPricing.end ?? 0"
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
												((originalPricing!.amount -
													promotionalPricing.amount) /
													originalPricing!.amount) *
												100
											).toFixed(0)
										}}% off
									</small>
								</td>
							</tr>
						</tbody>
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
				<AppTranslate v-if="form.method === 'add'">Add Package</AppTranslate>
				<AppTranslate v-else-if="form.method === 'edit'">Save Package</AppTranslate>
			</AppFormButton>
		</AppLoadingFade>
	</AppForm>
</template>
