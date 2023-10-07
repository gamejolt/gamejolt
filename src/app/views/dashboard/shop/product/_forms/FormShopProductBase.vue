<script lang="ts">
import {
	CSSProperties,
	PropType,
	Ref,
	computed,
	onUnmounted,
	ref,
	shallowReadonly,
	toRaw,
	watch,
} from 'vue';
import { useRouter } from 'vue-router';
import AppAlertBox from '../../../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import { ComponentProps } from '../../../../../../_common/component-helpers';
import { CreatorChangeRequestModel } from '../../../../../../_common/creator/change-request/creator-change-request.model';
import AppForm, {
	FormController,
	createForm,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
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
import { ModelStoreModel, storeModel } from '../../../../../../_common/model/model-store.service';
import {
	ShopProductModel,
	ShopProductResource,
} from '../../../../../../_common/shop/product/product-model';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeFg10 } from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleChangeBg } from '../../../../../../_styles/mixins';
import { kBorderWidthBase, kLineHeightComputed } from '../../../../../../_styles/variables';
import { numberSort } from '../../../../../../utils/array';
import { objectOmit } from '../../../../../../utils/object';
import { assertNever, run } from '../../../../../../utils/utils';
import { routeDashShopOverview } from '../../overview/overview.route';
import {
	ShopDashGroup,
	ShopDashProductType,
	ShopDashStore,
	getShopDashProductResourceParam,
	getShopDashProductType,
	useShopDashStore,
} from '../../shop.store';
import AppShopProductDiff from '../_diff/AppShopProductDiff.vue';

interface BaseFields {
	name: string;
	description: string | undefined;
	file: File | undefined;
}

export type ShopProductBaseFormFields = BaseFields;

export type ShopProductBaseForm = ReturnType<typeof createShopProductBaseForm>;

export const ShopProductCommonProps = {
	title: {
		type: String,
		required: true,
	},
};

export function createShopProductBaseForm<
	Fields extends Partial<BaseFields> & Record<string, any>,
	BaseModel extends ShopProductModel
>({
	shopStore,
	resource,
	baseModel,
	fields = {} as Fields,
	complexFields,
	onLoad,
}: {
	shopStore: ShopDashStore;
	resource: ShopProductResource;
	baseModel: BaseModel | undefined;
	fields?: Fields;
	complexFields?: (keyof Fields)[];
	onLoad?: (data: { payload: any }) => void;
}) {
	const router = useRouter();

	const productType = ref<ShopDashProductType>();
	if (baseModel) {
		productType.value = getShopDashProductType(baseModel);
	} else if (resource !== ShopProductResource.Sticker) {
		productType.value = ShopDashProductType.Premium;
	}

	const minNameLength = ref(3);
	const maxNameLength = ref(50);
	const maxFilesize = ref(5 * 1024 * 1024);
	const minWidth = ref(100);
	const maxWidth = ref(400);
	const minHeight = ref(100);
	const maxHeight = ref(400);
	const aspectRatio = ref(1);
	const canEditFree = ref(false);
	const canEditPremium = ref(false);

	const isEditing = Boolean(baseModel);
	const processedFileData = ref() as Ref<{ file: File; url: string } | undefined>;
	const tempImgUrl = ref<string | null>(null);

	const baseFields: BaseFields = {
		name: baseModel?.name || fields.name || '',
		description: baseModel?.description || fields.description,
		file: fields.file,
	};

	const initialFormModel = ref<BaseFields & Fields>({
		...baseFields,
		...fields,
	});

	const changeRequest = computed(() =>
		baseModel ? shopStore.getChangeRequest(baseModel) : undefined
	);

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

	function assignNonNull<T>(field: Ref<T>, value: T | null | undefined) {
		if (value !== undefined && value !== null) {
			field.value = value;
		}
	}

	const loadUrl = computed(() => {
		// We will only get data when there's a product type set.
		if (!productType.value) {
			return undefined;
		}

		let result: string;
		if (resource === ShopProductResource.StickerPack) {
			result = `/web/dash/creators/shop/packs/save`;
		} else {
			result = `/web/dash/creators/shop/collectibles/save/${resource}`;
		}
		if (baseModel?.id) {
			result += `/${baseModel.id}`;
		}
		return result + `?is_premium=${productType.value === ShopDashProductType.Premium ? 1 : 0}`;
	});

	const form: FormController<typeof initialFormModel.value> = createForm({
		// Clone the initial model. Forms are overwriting non-model data passed into here.
		model: initialFormModel,
		loadUrl,
		onLoad(payload: any) {
			// We will only get data when there's a product type set.
			if (!productType.value) {
				return;
			}

			assignNonNull(minNameLength, payload.minNameLength);
			assignNonNull(maxNameLength, payload.maxNameLength);
			assignNonNull(maxFilesize, payload.maxFilesize);

			assignNonNull(minWidth, payload.minWidth ?? payload.minSize);
			assignNonNull(maxWidth, payload.maxWidth ?? payload.maxSize);
			assignNonNull(minHeight, payload.minHeight ?? payload.minSize);
			assignNonNull(maxHeight, payload.maxHeight ?? payload.maxSize);

			assignNonNull(aspectRatio, payload.aspectRatio);
			assignNonNull(canEditFree, payload.canEditFree);
			assignNonNull(canEditPremium, payload.canEditPremium);

			// When editing

			// Update the shop store with the latest change request data.
			const latestChange = [payload.changeRequest, payload.rejectedChangeRequest]
				.filter(i => i)
				.map(i => storeModel(CreatorChangeRequestModel, i))
				.sort((a, b) => numberSort(b.added_on, a.added_on))[0];

			if (baseModel) {
				if (latestChange) {
					shopStore.storeChangeRequest(baseModel!, latestChange);
				} else {
					shopStore.removeChangeRequest(baseModel);
				}
			}

			if (baseModel) {
				if (latestChange) {
					shopStore.storeChangeRequest(baseModel, latestChange);
				} else {
					shopStore.removeChangeRequest(baseModel);
				}
			}

			if (latestChange) {
				const name = latestChange.change_name || form.formModel.name;
				form.formModel.name = name;
				// Update our initial form model with our common fields so that
				// diffs work properly for items that haven't been approved yet.
				if (!isEditing || !baseModel?.was_approved) {
					initialFormModel.value.name = name;
				}
			}

			/** Helper for nullable resource from the payload. */
			function maybeStoreModel(model: new () => ModelStoreModel) {
				if (payload.resource) {
					storeModel(model, payload.resource);
				}
			}

			switch (resource) {
				case ShopProductResource.AvatarFrame:
					maybeStoreModel(AvatarFrameModel);
					break;
				case ShopProductResource.Background:
					maybeStoreModel(BackgroundModel);
					break;
				case ShopProductResource.StickerPack:
					maybeStoreModel(StickerPackModel);
					break;
				case ShopProductResource.Sticker:
					maybeStoreModel(StickerModel);
					break;
				default:
					assertNever(resource);
			}

			onLoad?.({ payload });
		},
		onSubmit() {
			return Api.sendRequest(
				loadUrl.value!,
				{
					...objectOmit(form.formModel, ['description', 'file']),
					is_premium: productType.value === ShopDashProductType.Premium ? 1 : 0,
				},
				{
					detach: true,
					file: form.formModel.file,
					allowComplexData: complexFields as string[],
				}
			);
		},
		onSubmitError(_response) {
			showErrorGrowl($gettext(`There was an error saving your product.`));
		},
		onSubmitSuccess(response) {
			function updateGroup<T extends ShopProductModel>(
				group: Ref<ShopDashGroup<T>>,
				item: T
			) {
				if (!group.value.items.includes(item)) {
					group.value.items.push(item);
				}
				return item;
			}

			let updatedModel: ShopProductModel | undefined = baseModel;

			if (response.resource) {
				switch (resource) {
					case ShopProductResource.AvatarFrame:
						updatedModel = updateGroup(
							shopStore.avatarFrames,
							storeModel(AvatarFrameModel, response.resource)
						);
						break;
					case ShopProductResource.Background:
						updatedModel = updateGroup(
							shopStore.backgrounds,
							storeModel(BackgroundModel, response.resource)
						);
						break;
					case ShopProductResource.StickerPack:
						updatedModel = updateGroup(
							shopStore.stickerPacks,
							storeModel(StickerPackModel, response.resource)
						);
						break;
					case ShopProductResource.Sticker:
						updatedModel = updateGroup(
							shopStore.stickers,
							storeModel(StickerModel, response.resource)
						);
						break;
					default:
						assertNever(resource);
				}
			}

			if (updatedModel) {
				const updatedChangeRequest = response.changeRequest
					? storeModel(CreatorChangeRequestModel, response.changeRequest)
					: null;

				if (updatedChangeRequest) {
					shopStore.storeChangeRequest(updatedModel, updatedChangeRequest);
				} else {
					shopStore.removeChangeRequest(updatedModel);
				}
			}

			router.push({
				name: routeDashShopOverview.name,
			});
		},
	});

	// We'll assign to some Refs in here, so don't turn this into a computed.
	watch(
		[() => form.formModel.file, () => form.controlErrors.file, changeRequest, existingImgUrl],
		([file, fileError, latestChange, existingImgUrl]) => {
			const url = run(() => {
				if (!file || fileError || toRaw(file) === toRaw(processedFileData.value?.file)) {
					// If there's an issue with the temp file or it doesn't
					// exist, fallback to the current image.
					const media = latestChange?.change_media_item;
					if (media) {
						return media.is_animated ? media.img_url : media.mediaserver_url;
					}
					return existingImgUrl;
				}

				// Create a temporary URL for the file so we can display before upload.
				const windowUrl = window.URL || window.webkitURL;
				const oldImage = processedFileData.value?.url;
				processedFileData.value = { file, url: windowUrl.createObjectURL(file) };
				if (oldImage) {
					windowUrl.revokeObjectURL(oldImage);
				}
				return processedFileData.value.url;
			});

			tempImgUrl.value = url || null;
		},
		{ immediate: true }
	);

	onUnmounted(() => {
		// Cleanup any temp image data we were using in the form.
		if (processedFileData.value) {
			(window.URL || window.webkitURL).revokeObjectURL(processedFileData.value.url);
			processedFileData.value = undefined;
		}
	});

	function _compareFormDiff(other: typeof initialFormModel.value) {
		// Need to check differences in image urls between our base model and
		// any latest changes.
		if (existingImgUrl.value !== tempImgUrl.value) {
			return true;
		}

		return Object.entries(other).some(([key, val]) => {
			if (key === 'file' && form.controlErrors.file) {
				return false;
			}

			return !shopStore.isSameValues(val, form.formModel[key]);
		});
	}

	return shallowReadonly({
		form,
		resource,
		initialFormModel,
		baseModel,

		// Restrictions
		minNameLength,
		maxNameLength,
		maxFilesize,
		minWidth,
		maxWidth,
		minHeight,
		maxHeight,
		aspectRatio,
		canEditFree,
		canEditPremium,

		// Form helpers
		/** Image url that is on our existing shop product. */
		existingImgUrl,
		/** Temporary image url that we can use before upload. */
		tempImgUrl,
		setFile(file: File | File[] | null | undefined) {
			form.formModel.file = Array.isArray(file) ? file[0] : file || undefined;
		},
		assignNonNull,
		isEditing,
		productType,
		chooseProductType(type: ShopDashProductType) {
			productType.value = type;
			form.reload();
		},
		changeRequest,
		getFieldAvailabilityUrl(field: keyof typeof initialFormModel.value) {
			const id = baseModel?.id || 0;
			const safeField = String(field);
			if (resource === ShopProductResource.StickerPack) {
				return `/web/dash/creators/shop/packs/check-field-availability/${id}/${safeField}`;
			}
			return `/web/dash/creators/shop/collectibles/check-field-availability/${resource}/${id}/${safeField}`;
		},
		diffData: computed(() => {
			const hasBefore = !!baseModel && baseModel.was_approved;
			const hasAfter = !hasBefore || _compareFormDiff(initialFormModel.value);

			return {
				hasBefore,
				hasAfter,
				/**
				 * If there's a change between our {@link initialFormModel} and
				 * the {@link form.formModel}.
				 */
				hasChange: hasBefore === hasAfter,
			};
		}),
		diffKeys: Object.keys(fields).reduce((acc, key) => {
			// Only include items that aren't part of our base fields (name,
			// description, etc.)
			if (!(key in baseFields) && !acc.includes(key)) {
				acc.push(key);
			}
			return acc;
		}, [] as string[]),
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

// eslint-disable-next-line vue/no-setup-props-destructure
const {
	form,
	baseModel,
	resource,
	isEditing,
	productType,
	chooseProductType,
	setFile,
	minWidth,
	maxWidth,
	minHeight,
	maxHeight,
	aspectRatio,
	maxFilesize,
	minNameLength,
	maxNameLength,
	getFieldAvailabilityUrl,
} = props.data;

const { getGroupForResource } = useShopDashStore()!;

const productTypeSelectorStyle: CSSProperties = {
	...styleBorderRadiusLg,
	...styleChangeBg('bg-offset'),
	padding: `24px`,
	border: `${kBorderWidthBase.px} solid ${kThemeFg10}`,
	flex: 1,
	cursor: `pointer`,
};

const formGroupBindings: Partial<ComponentProps<typeof AppFormGroup>> & { style: CSSProperties } = {
	tinyLabelMargin: true,
	style: {
		marginBottom: kLineHeightComputed.px,
	},
};

const managerGroup = computed(() => getGroupForResource(resource));
</script>

<template>
	<AppForm :controller="form">
		<template v-if="!productType">
			<div
				:style="{
					display: `flex`,
					flexDirection: `row`,
					gap: `30px`,
				}"
			>
				<div
					:style="productTypeSelectorStyle"
					@click="chooseProductType(ShopDashProductType.Basic)"
				>
					<div :style="{ fontWeight: `bold` }">
						{{ $gettext(`Basic`) }}
					</div>
					<div>
						{{
							$gettext(
								`These are rewarded to users from reward sticker packs for placing charged stickers on your content. They can not be included in premium sticker packs. Static images only; they can't be animated.`
							)
						}}
					</div>
				</div>

				<div
					:style="productTypeSelectorStyle"
					@click="chooseProductType(ShopDashProductType.Premium)"
				>
					<div :style="{ fontWeight: `bold` }">
						{{ $gettext(`Premium`) }}
					</div>
					<div>
						{{
							$gettext(
								`Premium stickers can be sold in premium sticker packs from your shop. They can not be included in charge sticker packs. Only animated images are accepted.`
							)
						}}
					</div>
				</div>
			</div>
		</template>
		<template v-else>
			<AppShopProductDiff :data="data" />

			<AppSpacer vertical :scale="4" />

			<template
				v-if="productType !== ShopDashProductType.Premium && !managerGroup.canEditFree"
			>
				<AppAlertBox fill-color="offset" icon="notice">
					{{ $gettext(`You are currently unable to edit free products.`) }}
				</AppAlertBox>
			</template>
			<template
				v-else-if="
					productType === ShopDashProductType.Premium && !managerGroup.canEditPremium
				"
			>
				<AppAlertBox fill-color="offset" icon="notice">
					{{ $gettext(`You are currently unable to edit premium products.`) }}
				</AppAlertBox>
			</template>
			<template
				v-else-if="
					productType === ShopDashProductType.Premium && baseModel?.was_approved === true
				"
			>
				<!-- TODO(creator-shops) -->
				<AppAlertBox fill-color="offset" icon="info-circle">
					{{
						$gettext(
							`This product has been approved. You're no longer able to modify it.`
						)
					}}
				</AppAlertBox>
			</template>
			<template v-else>
				<AppFormGroup
					v-bind="formGroupBindings"
					name="file"
					:label="
						productType === ShopDashProductType.Premium
							? $gettext(`Upload animated image`)
							: $gettext(`Upload image`)
					"
					:optional="isEditing"
				>
					<div class="help-block">
						<div v-if="productType === ShopDashProductType.Premium">
							{{ $gettext(`Your image must be an animated PNG (APNG).`) }}
						</div>
						<div v-else>{{ $gettext(`Your image must be a PNG.`) }}</div>

						<div
							v-translate="{
								min: `${minWidth}×${minHeight}`,
								max: `${maxWidth}×${maxHeight}`,
							}"
						>
							Images must be between
							<code>%{min}</code>
							and
							<code>%{max}</code>
							(ratio of 1 ÷
							{{
								aspectRatio === 1
									? 1
									: Math.trunc((1 / (maxWidth / maxHeight)) * 100) / 100
							}}).
						</div>
					</div>

					<p class="help-block">
						<!-- TODO(creator-shops) DODO(creator-shops) help docs. -->
						<AppLinkHelpDocs
							category="creators"
							:page="getShopDashProductResourceParam(resource)"
							class="link-help"
						>
							{{
								$gettext(
									`What are the shop product image requirements and guidelines?`
								)
							}}
						</AppLinkHelpDocs>
					</p>

					<AppFormControlUpload
						:validators="[
							validateFilesize(maxFilesize),
							validateImageMinDimensions({
								width: minWidth,
								height: minHeight,
							}),
							validateImageMaxDimensions({
								width: maxWidth,
								height: maxHeight,
							}),
							validateImageAspectRatio({ ratio: aspectRatio }),
						]"
						accept=".png"
						@changed="setFile"
					/>

					<AppFormControlErrors :label="$gettext(`image`)">
						<AppFormControlError
							when="file:missing-required-animated-image"
							:message="
								$gettext(
									`Premium products must be animated. Please upload an animated PNG file.`
								)
							"
						/>
					</AppFormControlErrors>
				</AppFormGroup>

				<!-- Reward types are automatically named at the moment. -->
				<AppFormGroup
					v-if="productType !== ShopDashProductType.Reward"
					v-bind="formGroupBindings"
					name="name"
				>
					<AppFormControl
						:placeholder="$gettext(`Product name...`)"
						:validators="[
							validateMinLength(minNameLength),
							validateMaxLength(maxNameLength),
							validateAvailability({
								initVal: baseModel?.name,
								url: getFieldAvailabilityUrl('name'),
							}),
						]"
					/>

					<AppFormControlErrors />
				</AppFormGroup>

				<slot name="fields" v-bind="{ formGroupBindings }" />

				<AppAlertBox
					v-if="productType === ShopDashProductType.Premium"
					icon="notice"
					fill-color="offset"
				>
					<strong>
						{{ $gettext(`Careful!`) }}
					</strong>
					{{
						$gettext(
							`Since this is a premium product, you will not be able to make changes once it's been reviewed.`
						)
					}}
				</AppAlertBox>

				<AppSpacer vertical :scale="4" />

				<div class="text-right">
					<AppFormButton v-if="form.changed && form.valid">
						{{
							productType === ShopDashProductType.Premium
								? $gettext(`Submit for review`)
								: $gettext(`Save`)
						}}
					</AppFormButton>
				</div>

				<AppSpacer vertical :scale="10" />
			</template>
		</template>
	</AppForm>
</template>
