<script lang="ts" setup>
import { CSSProperties, Ref, onMounted, ref } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { kBorderWidthBase } from '../../../_styles/variables';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import { formatCurrency } from '../../filters/currency';
import { formatNumber } from '../../filters/number';
import { showSuccessGrowl } from '../../growls/growls.service';
import AppIllustration from '../../illustration/AppIllustration.vue';
import { illExtremeSadness } from '../../illustration/illustrations';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { storeModelList } from '../../model/model-store.service';
import { Screen } from '../../screen/screen-service';
import AppSpacer from '../../spacer/AppSpacer.vue';
import { useCommonStore } from '../../store/common-store';
import { kThemeFg10 } from '../../theme/variables';
import { $gettext } from '../../translate/translate.service';
import AppMicrotransactionItem from '../AppMicrotransactionItem.vue';
import AppMicrotransactionPaymentForm from '../payment-form/AppMicrotransactionPaymentForm.vue';
import { MicrotransactionProductModel } from '../product.model';

const { joltbuxBalance } = useCommonStore();

const isLoading = ref(true);
const hasError = ref(false);
const mtxProducts = ref([]) as Ref<MicrotransactionProductModel[]>;
const selectedProduct = ref(null) as Ref<MicrotransactionProductModel | null>;
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
			mtxProducts.value = storeModelList(
				MicrotransactionProductModel,
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

function onBought(product: MicrotransactionProductModel) {
	const { product_type: type, product_amount: amount } = product;
	let message = '';

	if (type === 'joltbux') {
		if (amount > 0) {
			joltbuxBalance.value += amount;
			message = $gettext(`%{ amount } Joltbux have been added to your account`, {
				amount: formatNumber(amount),
			});
		}
	}

	showSuccessGrowl(message || $gettext(`Your purchase was successful`));
	modal.dismiss();
}

const itemBorderSeperatorStyles: CSSProperties = {
	borderBottom: `solid ${kBorderWidthBase.px} ${kThemeFg10}`,
};
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
					alignItems: `center`,
				}"
			>
				<template v-if="selectedProduct">
					<div
						:style="{
							height: 0,
							display: `inline-flex`,
							alignItems: `center`,
						}"
					>
						<AppButton
							:disabled="isProcessingPayment"
							sparse
							trans
							circle
							icon="chevron-left"
							@click="selectedProduct = null"
						/>
					</div>
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
				<template v-if="selectedProduct.product_type === 'joltbux'">
					<AppMicrotransactionItem :item="selectedProduct" />

					<AppSpacer vertical :scale="3" />
				</template>

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
					<template v-if="isLoading">
						<AppMicrotransactionItem
							v-for="i in 3"
							:key="i"
							:style="styleWhen(i < 3, itemBorderSeperatorStyles)"
							:dynamic-slots="['trailing']"
							is-placeholder
						/>
					</template>
					<template v-else-if="!mtxProducts.length">
						<AppIllustration
							:asset="illExtremeSadness"
							:max-width="Screen.width * 0.75"
						>
							{{
								$gettext(
									`Sorry! There are no items available right now, check again later.`
								)
							}}
						</AppIllustration>
					</template>
					<AppMicrotransactionItem
						v-for="(item, index) in mtxProducts"
						v-else
						:key="item.id"
						:item="item"
						:dynamic-slots="
							item.sellable && item.sellable.pricings.length ? ['trailing'] : false
						"
						:style="
							styleWhen(index < mtxProducts.length - 1, itemBorderSeperatorStyles)
						"
					>
						<template #trailing>
							<AppButton
								v-if="item.sellable && item.sellable.pricings.length"
								solid
								primary
								@click="selectedProduct = item"
							>
								{{ formatCurrency(item.sellable.pricings[0].amount) }}
							</AppButton>
						</template>
					</AppMicrotransactionItem>
				</AppLoadingFade>
			</template>
		</div>
	</AppModal>
</template>
