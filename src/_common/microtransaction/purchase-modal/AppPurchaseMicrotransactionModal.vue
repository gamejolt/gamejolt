<script lang="ts" setup>
import { Ref, onMounted, ref } from 'vue';
import { styleWhen } from '../../../_styles/mixins';
import { kBorderWidthBase, kFontFamilyHeading, kFontSizeLarge } from '../../../_styles/variables';
import { Api } from '../../api/api.service';
import AppButton from '../../button/AppButton.vue';
import { showInfoGrowl } from '../../growls/growls.service';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppLoadingFade from '../../loading/AppLoadingFade.vue';
import AppModal from '../../modal/AppModal.vue';
import { useModal } from '../../modal/modal.service';
import { Screen } from '../../screen/screen-service';
import { kThemeFg10 } from '../../theme/variables';
import { $gettext } from '../../translate/translate.service';
import { MicrotransactionProduct } from '../product.model';

// TODO(mtx-checkout) Remove or finish this: purchase flow, prices for MtxProducts, etc.

const isLoading = ref(true);
const hasError = ref(false);

const mtxProducts = ref([]) as Ref<MicrotransactionProduct[]>;

onMounted(async () => {
	isLoading.value = true;
	hasError.value = false;

	try {
		const response = await Api.sendRequest(
			`/web/checkout/microtransactions/products`,
			undefined,
			{ detach: true }
		);

		if (response.success === false) {
			throw response;
		}

		if (response.products && Array.isArray(response.products)) {
			mtxProducts.value = MicrotransactionProduct.populate(response.products);
		}
	} catch (e) {
		console.error('Error loading products', e);
		hasError.value = true;
	} finally {
		isLoading.value = false;
	}
});

const modal = useModal()!;
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2 class="modal-title sans-margin-bottom">
				{{ $gettext(`Purchase Joltbux`) }}
			</h2>
		</div>

		<div class="modal-body">
			<AppLoadingFade :is-loading="isLoading">
				<div
					:style="{
						minHeight: `${Math.min(Screen.height * 0.5, 500)}px`,
					}"
				>
					<div
						v-for="(item, index) in mtxProducts"
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
							:style="{
								minHeight: `48px`,
								display: `flex`,
								alignItems: `center`,
								flex: `none`,
							}"
						>
							<AppButton
								solid
								primary
								@click="
									// TODO(mtx-checkout) remove this, do purchase flow
									showInfoGrowl(
										$gettext(
											`We've been trying to contact you about your car's extended warranty.`
										),
										$gettext('Ring, ring!')
									)
								"
							>
								<!-- TODO(mtx-checkout) purchase amount -->
								{{ $gettext(`Purchase`) }}
							</AppButton>
						</div>
					</div>
				</div>
			</AppLoadingFade>
		</div>
	</AppModal>
</template>
