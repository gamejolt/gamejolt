<script lang="ts">
import {
	PropType,
	Ref,
	computed,
	onUnmounted,
	readonly,
	ref,
	shallowReadonly,
	toRaw,
	toRefs,
} from 'vue';
import { useRouter } from 'vue-router';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { CreatorChangeRequestModel } from '../../../../../../_common/creator/change-request/creator-change-request.model';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import AppForm, { createForm } from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlUpload from '../../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateAvailability,
	validateFilesize,
	validateImageAspectRatio,
	validateImageMaxDimensions,
	validateImageMinDimensions,
	validateMaxLength,
	validateMinLength,
} from '../../../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import AppLinkHelpDocs from '../../../../../../_common/link/AppLinkHelpDocs.vue';
import { storeModel } from '../../../../../../_common/model/model-store.service';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeFg10 } from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleChangeBg } from '../../../../../../_styles/mixins';
import { kBorderWidthBase, kLineHeightComputed } from '../../../../../../_styles/variables';
import { sleep } from '../../../../../../utils/utils';
import { ShopManagerGroupItem, ShopManagerGroupItemType } from '../../RouteDashShop.vue';
import { routeDashShopOverview } from '../../overview/overview.route';
import AppShopProductDiff from '../AppShopProductDiff.vue';

interface BaseFields {
	name: string;
	description: string | undefined;
	file: File | undefined;
}

type ShopProductBaseForm = ReturnType<typeof createShopProductBaseForm>;

export const enum ShopProductPaymentType {
	Free = 'free',
	Premium = 'premium',
}

export function createShopProductBaseForm<
	Fields extends Partial<BaseFields> & Record<string, any>,
	BaseModel extends ShopManagerGroupItem
>({
	typename,
	baseModel,
	fields = {} as Fields,
}: {
	typename: ShopManagerGroupItemType;
	baseModel: BaseModel | undefined;
	fields?: Fields;
}) {
	const router = useRouter();

	const paymentType = ref<ShopProductPaymentType>();
	const minNameLength = ref(3);
	const maxNameLength = ref(50);
	const maxFilesize = ref(5 * 1024 * 1024);
	const minSize = ref(100);
	const maxSize = ref(400);
	const aspectRatio = ref(1);
	const canEditFree = ref(false);
	const canEditPremium = ref(false);

	const changeRequest = ref(null) as Ref<CreatorChangeRequestModel | null>;
	const rejectedChangeRequest = ref(null) as Ref<CreatorChangeRequestModel | null>;

	const processedFileData = ref() as Ref<{ file: File; url: string } | undefined>;

	function _getFile(file: File | File[] | null | undefined) {
		if (!file) {
			return undefined;
		}

		return Array.isArray(file) ? file[0] : file;
	}

	const isEditing = Boolean(baseModel);

	const existingImgUrl = computed(() => {
		if (baseModel) {
			if (baseModel instanceof AvatarFrameModel) {
				return baseModel.image_url;
			} else if (baseModel instanceof BackgroundModel) {
				return baseModel.media_item.is_animated
					? baseModel.media_item.img_url
					: baseModel.media_item.mediaserver_url;
			} else if (baseModel instanceof StickerPackModel) {
				return baseModel.media_item.mediaserver_url;
			} else if (baseModel instanceof StickerModel) {
				return baseModel.img_url;
			}
		}

		return null;
	});

	const imgUrl = computed(() => {
		// If we weren't provided a model to edit, try grabbing one from our
		// file.
		const file = _getFile(form.formModel.file);
		if (
			!file ||
			// form.controlErrors.file ||
			toRaw(file) === toRaw(processedFileData.value?.file)
		) {
			return processedFileData.value?.url || null;
		}

		const windowUrl = window.URL || window.webkitURL;
		processedFileData.value = { file, url: windowUrl.createObjectURL(file) };
		const oldImage = processedFileData.value?.url;
		if (oldImage) {
			windowUrl.revokeObjectURL(oldImage);
		}
		return processedFileData.value.url;
	});

	onUnmounted(() => {
		if (processedFileData.value) {
			(window.URL || window.webkitURL).revokeObjectURL(processedFileData.value.url);
			processedFileData.value = undefined;
		}
	});

	function choosePaymentType(type: ShopProductPaymentType) {
		paymentType.value = type;
		form.reload();
	}

	function assignNonNull<T>(field: Ref<T>, value: T | null | undefined) {
		if (value !== undefined && value !== null) {
			field.value = value;
		}
	}

	const initialFormModel = ref<BaseFields & Fields>({
		name: baseModel?.name || '',
		description: baseModel?.description || '',
		file: undefined,
		...fields,
	});

	const form = createForm({
		model: initialFormModel,
		loadUrl: computed(() => {
			// We will only get data when there's a payment type set.
			if (!paymentType.value) {
				return undefined;
			}

			let result = `/web/dash/creators/shop/collectibles/save/${typename}`;
			// if (id) {
			// 	result += `/${id}`;
			// }
			return result + `?is_premium=${paymentType.value === ShopProductPaymentType.Premium}`;
		}),
		onLoad(payload: any) {
			// We will only get data when there's a payment type set.
			if (!paymentType.value) {
				return;
			}

			assignNonNull(minNameLength, payload.minNameLength);
			assignNonNull(maxNameLength, payload.maxNameLength);
			assignNonNull(maxFilesize, payload.maxFilesize);
			assignNonNull(minSize, payload.minSize);
			assignNonNull(maxSize, payload.maxSize);
			assignNonNull(aspectRatio, payload.aspectRatio);
			assignNonNull(canEditFree, payload.canEditFree);
			assignNonNull(canEditPremium, payload.canEditPremium);

			// Stickers
			// assignNonNull(emojiNameMinLength, payload.emojiNameMinLength);
			// assignNonNull(emojiNameMaxLength, payload.emojiNameMaxLength);

			// When editing
			assignNonNull(changeRequest, payload.changeRequest);
			assignNonNull(rejectedChangeRequest, payload.rejectedChangeRequest);

			// This will update the model that this form is bound to.
			if (payload.resource) {
				switch (typename) {
					case 'Avatar_Frame': {
						storeModel(AvatarFrameModel, payload.resource);
						break;
					}
					case 'Background': {
						storeModel(BackgroundModel, payload.resource);
						break;
					}
					case 'Sticker_Pack': {
						storeModel(StickerPackModel, payload.resource);
						break;
					}
					case 'Sticker': {
						storeModel(StickerModel, payload.resource);
						break;
					}
				}

				// controller.addItem(existingModel.value);
			}
		},
		onSubmit() {
			return sleep(1_000);
		},
		onSubmitError(_response) {
			// TODO(creator-shops) errors
			let message: string | null = null;

			showErrorGrowl(message || $gettext(`There was an error saving your product.`));
		},
		onSubmitSuccess() {
			// TODO(creator-shops) best way to go back to the overview?
			router.push({
				name: routeDashShopOverview.name,
			});
		},
	});

	return shallowReadonly({
		form,
		typename,
		initialFormModel: readonly(initialFormModel),
		baseModel,
		isEditing,

		paymentType,
		choosePaymentType,

		// Restrictions

		minNameLength,
		maxNameLength,
		maxFilesize,
		minSize,
		maxSize,
		aspectRatio,
		canEditFree,
		canEditPremium,

		// Form helpers
		existingImgUrl,
		imgUrl,
		// isEditing: computed(() => !!existingModel.value),
		setFile(file: File | File[] | null | undefined) {
			form.formModel.file = _getFile(file);
		},
		assignNonNull,
	});
}
</script>

<script lang="ts" setup>
const props = defineProps({
	data: {
		type: Object as PropType<ShopProductBaseForm>,
		required: true,
	},
});

const { data } = toRefs(props);

// Not really a big deal, but this isn't reactive...
const {
	form,
	baseModel,
	// typename,
	initialFormModel,
	isEditing,
	paymentType,
	choosePaymentType,
	setFile,
	existingImgUrl,
	imgUrl,
} = data.value;

const validateNameAvailabilityPath = computed(() => {
	// if (model?.value) {
	// 	return `/web/dash/creators/stickers/check-field-availability/${model.value.id}/name`;
	// }
	return `/web/dash/creators/stickers/check-field-availability/0/name`;
});

// TODO(creator-shops) remove
const useDebugData = true;

const premiumSelectorStyle = {
	...styleBorderRadiusLg,
	...styleChangeBg('bg-offset'),
	padding: `24px`,
	border: `${kBorderWidthBase.px} solid ${kThemeFg10}`,
	flex: 1,
	cursor: `pointer`,
};
</script>

<template>
	<AppForm :controller="form">
		<AppExpand :when="!paymentType">
			<div
				:style="{
					display: `flex`,
					flexDirection: `row`,
					gap: `30px`,
				}"
			>
				<div
					:style="premiumSelectorStyle"
					@click="choosePaymentType(ShopProductPaymentType.Free)"
				>
					<div :style="{ fontWeight: `bold` }">
						{{ $gettext(`Free`) }}
					</div>
					<div :style="{ fontStyle: `italic` }">
						{{ $gettext(`Explain the free products`) }}
					</div>
				</div>

				<div
					:style="premiumSelectorStyle"
					@click="choosePaymentType(ShopProductPaymentType.Premium)"
				>
					<div :style="{ fontWeight: `bold` }">
						{{ $gettext(`Premium`) }}
					</div>
					<div :style="{ fontStyle: `italic` }">
						{{ $gettext(`Explain the premium products`) }}
					</div>
				</div>
			</div>
		</AppExpand>

		<AppExpand :when="!!paymentType">
			<div class="row">
				<div class="col-xs-12 col-md-10 col-lg-8">
					<AppShopProductDiff>
						<template #before>
							<slot
								v-if="existingImgUrl"
								name="diff"
								state="before"
								:img-url="existingImgUrl"
								:model="initialFormModel"
							/>
							<div v-else>You're adding, there is no previous.</div>
							<!-- <AppDashShopItemImg :typename="typename" :img-url="existingImgUrl" /> -->
						</template>

						<template #after>
							<slot
								name="diff"
								state="after"
								:img-url="imgUrl"
								:model="form.formModel"
							/>
							<!-- <AppDashShopItemImg :typename="typename" :img-url="imgUrl" /> -->
						</template>
					</AppShopProductDiff>

					<AppFormGroup
						name="file"
						:label="$gettext(`Upload your image`)"
						tiny-label-margin
						:optional="isEditing"
					>
						<p class="help-block">
							{{ $gettext(`Your product image must be a PNG.`) }}
						</p>
						<p
							v-translate="{
								min: `${data.minSize.value}×${data.minSize.value}`,
								max: `${data.maxSize.value}×${data.maxSize.value}`,
							}"
							class="help-block strong"
						>
							Images must be between
							<code>%{min}</code>
							and
							<code>%{max}</code>
							(ratio of {{ data.aspectRatio.value }} ÷ 1).
						</p>

						<p class="help-block">
							<AppLinkHelpDocs
								category="creators"
								:page="useDebugData ? `shop` : `stickers`"
								class="link-help"
							>
								<!-- TODO(creator-shops) Do we need different pages for the product types? -->
								{{
									$gettext(
										`What are the shop product image requirements and guidelines?`
									)
								}}
							</AppLinkHelpDocs>
						</p>

						<AppFormControlUpload
							:validators="[
								validateFilesize(data.maxFilesize.value),
								validateImageMinDimensions({
									width: data.minSize.value,
									height: data.minSize.value,
								}),
								validateImageMaxDimensions({
									width: data.maxSize.value,
									height: data.maxSize.value,
								}),
								validateImageAspectRatio({ ratio: data.aspectRatio.value }),
								// TODO(creator-shops) Need to figure out what filetypes we're accepting.
							]"
							accept=".png"
							fix-overflow
							@changed="setFile"
						/>

						<AppFormControlErrors :label="$gettext(`sticker image`)" />
					</AppFormGroup>

					<AppFormGroup
						name="name"
						label="Product name"
						tiny-label-margin
						:style="{
							marginBottom: kLineHeightComputed.px,
						}"
					>
						<AppFormControl
							:placeholder="$gettext(`Product name...`)"
							:validators="[
								validateMinLength(data.minNameLength.value),
								validateMaxLength(data.maxNameLength.value),
								validateAvailability({ url: validateNameAvailabilityPath }),
							]"
						/>

						<AppFormControlErrors :label="$gettext(`product name`)" />
					</AppFormGroup>

					<slot />

					<AppFormStickySubmit
						:style="{
							marginTop: kLineHeightComputed.px,
						}"
					>
						<AppFormButton>
							{{ $gettext(`Save`) }}
						</AppFormButton>
					</AppFormStickySubmit>
				</div>
			</div>
		</AppExpand>
	</AppForm>
</template>
