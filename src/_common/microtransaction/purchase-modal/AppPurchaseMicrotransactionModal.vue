<script lang="ts" setup>
import { Ref, onMounted, ref } from 'vue';
import { styleBorderRadiusBase, styleWhen } from '../../../_styles/mixins';
import {
	kBorderWidthBase,
	kFontFamilyHeading,
	kFontSizeLarge,
	kLineHeightBase,
} from '../../../_styles/variables';
import { illExtremeSadnessSmall } from '../../../app/img/ill/illustrations';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import { formatCurrency } from '../../filters/currency';
import { formatNumber } from '../../filters/number';
import { showSuccessGrowl } from '../../growls/growls.service';
import AppIllustration from '../../illustration/AppIllustration.vue';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { Screen } from '../../screen/screen-service';
import { useCommonStore } from '../../store/common-store';
import { kThemeFg10 } from '../../theme/variables';
import { $gettext, $gettextInterpolate } from '../../translate/translate.service';
import AppMicrotransactionPaymentForm from '../payment-form/AppMicrotransactionPaymentForm.vue';
import { MicrotransactionProduct } from '../product.model';

const { joltbuxBalance } = useCommonStore();

const isLoading = ref(true);
const hasError = ref(false);
const mtxProducts = ref([]) as Ref<MicrotransactionProduct[]>;
const selectedProduct = ref(null) as Ref<MicrotransactionProduct | null>;
const isProcessingPayment = ref(false);

onMounted(async () => {
	isLoading.value = true;
	hasError.value = false;

	try {
		const storeType = GJ_IS_DESKTOP_APP ? 'desktop' : 'web';
		const response = await Api.sendRequest(
			`/web/checkout/microtransactions/products/${storeType}`,
			undefined,
			{ detach: true }
		);

		if (response.success === false) {
			throw response;
		}

		if (response.products && Array.isArray(response.products)) {
			// Only show products that have a valid price.
			mtxProducts.value = MicrotransactionProduct.populate<MicrotransactionProduct>(
				response.products
			).filter(i => !!i.sellable && i.sellable.pricings.length);
		}
	} catch (e) {
		console.error('Error loading products', e);
		hasError.value = true;
	} finally {
		isLoading.value = false;
	}
});

const modal = useModal()!;

function onBought(product: MicrotransactionProduct) {
	const { product_type: type, product_amount: amount } = product;
	let message = '';

	if (type === 'joltbux') {
		if (amount > 0) {
			joltbuxBalance.value += amount;
			message = $gettextInterpolate(`%{ amount } Joltbux have been added to your account`, {
				amount: formatNumber(amount),
			});
		}
	}

	showSuccessGrowl(message || $gettext(`Your purchase was successful`));
	modal.dismiss();
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<div
				:style="{
					display: `flex`,
					gap: `12px`,
				}"
			>
				<template v-if="selectedProduct">
					<AppButton
						:disabled="isProcessingPayment"
						sparse
						trans
						circle
						icon="chevron-left"
						@click="selectedProduct = null"
					/>
				</template>

				<h2 class="modal-title sans-margin-bottom">
					<template v-if="selectedProduct">
						{{ $gettext(`Select a payment method`) }}
					</template>
					<template v-else>
						{{ $gettext(`Select a product`) }}
					</template>
				</h2>
			</div>
		</div>

		<div class="modal-body">
			<template v-if="selectedProduct && selectedProduct.sellable">
				<AppMicrotransactionPaymentForm
					:sellable="selectedProduct.sellable"
					@bought="onBought(selectedProduct)"
					@processing-changed="isProcessingPayment = $event"
				/>
			</template>
			<template v-else-if="selectedProduct && !selectedProduct.sellable">
				<div>
					{{ $gettext(`This product is not available for purchase.`) }}
				</div>
			</template>
			<template v-else>
				<AppLoadingFade :is-loading="isLoading">
					<!-- TODO(mtx-checkout) const/computed stylings for real items and placeholders -->
					<template v-if="isLoading">
						<div
							v-for="i in 3"
							:key="i"
							:style="{
								display: `flex`,
								alignItems: `flex-start`,
								gap: `12px`,
								padding: `8px 0`,
								...styleWhen(i < 3, {
									borderBottom: `solid ${kBorderWidthBase.px} ${kThemeFg10}`,
								}),
							}"
						>
							<div
								:style="{
									width: `48px`,
									height: `48px`,
									flex: `none`,
									background: kThemeFg10,
									...styleBorderRadiusBase,
								}"
							/>

							<div
								:style="{
									flex: `auto`,
									alignSelf: `center`,
									height: kFontSizeLarge.value * kLineHeightBase + 'px',
									background: kThemeFg10,
									...styleBorderRadiusBase,
								}"
							/>

							<div
								:style="{
									minHeight: `48px`,
									display: `flex`,
									alignItems: `center`,
									flex: `none`,
								}"
							>
								<div
									:style="{
										height: `36px`,
										width: `48px`,
										background: kThemeFg10,
										...styleBorderRadiusBase,
									}"
								/>
							</div>
						</div>
					</template>
					<template v-else-if="!mtxProducts.length">
						<AppIllustration
							:asset="illExtremeSadnessSmall"
							:max-width="Screen.width * 0.75"
						>
							{{
								$gettext(
									`Sorry! There are no items available right now, check again later.`
								)
							}}
						</AppIllustration>
					</template>
					<div
						v-for="(item, index) in mtxProducts"
						v-else
						:key="item.id"
						:style="{
							display: `flex`,
							alignItems: `flex-start`,
							gap: `12px`,
							padding: `8px 0`,
							...styleWhen(index < mtxProducts.length - 1, {
								borderBottom: `solid ${kBorderWidthBase.px} ${kThemeFg10}`,
							}),
						}"
					>
						<div
							:style="{
								width: `48px`,
								height: `48px`,
								flex: `none`,
							}"
						>
							<AppImgResponsive
								:src="item.media_item.mediaserver_url"
								:style="{
									width: `100%`,
									height: `100%`,
									objectFit: `cover`,
									objectPosition: `center`,
								}"
							/>
						</div>

						<div
							:style="{
								flex: `auto`,
								minWidth: 0,
								fontSize: kFontSizeLarge.px,
								fontFamily: kFontFamilyHeading,
								minHeight: `48px`,
								display: `inline-flex`,
								alignItems: `center`,
							}"
						>
							{{ item.display_name }}
						</div>

						<div
							v-if="!!item.sellable && item.sellable.pricings[0]"
							:style="{
								minHeight: `48px`,
								display: `flex`,
								alignItems: `center`,
								flex: `none`,
							}"
						>
							<AppButton solid primary @click="selectedProduct = item">
								{{ formatCurrency(item.sellable.pricings[0].amount) }}
							</AppButton>
						</div>
					</div>
				</AppLoadingFade>
			</template>
		</div>
	</AppModal>
</template>
