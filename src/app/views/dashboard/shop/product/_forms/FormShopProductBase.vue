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
import { ModelStoreModel, storeModel } from '../../../../../../_common/model/model-store.service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import { kThemeFg10 } from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleChangeBg } from '../../../../../../_styles/mixins';
import { kBorderWidthBase, kLineHeightComputed } from '../../../../../../_styles/variables';
import { objectOmit } from '../../../../../../utils/object';
import { run } from '../../../../../../utils/utils';
import { routeDashShopOverview } from '../../overview/overview.route';
import {
	ShopManagerGroup,
	ShopManagerGroupItem,
	ShopManagerGroupItemType,
	ShopManagerStore,
	productTypeFromTypename,
	useShopManagerStore,
} from '../../shop.store';
import AppShopProductDiff from '../_diff/AppShopProductDiff.vue';

interface BaseFields {
	name: string;
	description: string | undefined;
	file: File | undefined;
}

export type ShopProductBaseFormFields = BaseFields;

export type ShopProductBaseForm = ReturnType<typeof createShopProductBaseForm>;

export const enum ShopProductPaymentType {
	Free = 'free',
	Premium = 'premium',
}

export const shopProductCommonProps = {
	title: {
		type: String,
		required: true,
	},
};

export function createShopProductBaseForm<
	Fields extends Partial<BaseFields> & Record<string, any>,
	BaseModel extends ShopManagerGroupItem
>({
	shopStore,
	typename,
	baseModel,
	fields = {} as Fields,
	complexFields,
	onLoad,
}: {
	shopStore: ShopManagerStore;
	typename: ShopManagerGroupItemType;
	baseModel: BaseModel | undefined;
	fields?: Fields;
	complexFields?: (keyof Fields)[];
	onLoad?: (data: { payload: any }) => void;
}) {
	const router = useRouter();

	const paymentType = ref<ShopProductPaymentType>();
	if (baseModel) {
		paymentType.value = baseModel.is_premium
			? ShopProductPaymentType.Premium
			: ShopProductPaymentType.Free;
	} else if (typename !== 'Sticker') {
		paymentType.value = ShopProductPaymentType.Premium;
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

	const changeRequest = ref(null) as Ref<CreatorChangeRequestModel | null>;
	const rejectedChangeRequest = ref(null) as Ref<CreatorChangeRequestModel | null>;

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

	const latestChangeRequest = computed(() => {
		const change = changeRequest.value;
		const rejectedChange = rejectedChangeRequest.value;

		if (change && rejectedChange) {
			return change.added_on > rejectedChange.added_on ? change : rejectedChange;
		} else if (change) {
			return change;
		} else if (rejectedChange) {
			return rejectedChange;
		}
		return null;
	});

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
		// We will only get data when there's a payment type set.
		if (!paymentType.value) {
			return undefined;
		}

		let result: string;
		if (typename === 'Sticker_Pack') {
			result = `/web/dash/creators/shop/packs/save`;
		} else {
			result = `/web/dash/creators/shop/collectibles/save/${typename}`;
		}
		if (baseModel?.id) {
			result += `/${baseModel.id}`;
		}
		return (
			result + `?is_premium=${paymentType.value === ShopProductPaymentType.Premium ? 1 : 0}`
		);
	});

	const form: FormController<typeof initialFormModel.value> = createForm({
		// Clone the initial model. Forms are overwriting non-model data passed into here.
		model: initialFormModel,
		loadUrl,
		onLoad(payload: any) {
			// We will only get data when there's a payment type set.
			if (!paymentType.value) {
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
			if (payload.changeRequest) {
				changeRequest.value = storeModel(CreatorChangeRequestModel, payload.changeRequest);
			}
			if (payload.rejectedChangeRequest) {
				rejectedChangeRequest.value = storeModel(
					CreatorChangeRequestModel,
					payload.rejectedChangeRequest
				);
			}

			const latestChange = latestChangeRequest.value;
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

			switch (typename) {
				case 'Avatar_Frame':
					maybeStoreModel(AvatarFrameModel);
					break;
				case 'Background':
					maybeStoreModel(BackgroundModel);
					break;
				case 'Sticker_Pack':
					maybeStoreModel(StickerPackModel);
					break;
				case 'Sticker':
					maybeStoreModel(StickerModel);
					break;
			}

			onLoad?.({ payload });
		},
		onSubmit() {
			return Api.sendRequest(
				loadUrl.value!,
				{
					...objectOmit(form.formModel, ['description', 'file']),
					is_premium: paymentType.value === ShopProductPaymentType.Premium ? 1 : 0,
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
			function updateGroup<T extends ShopManagerGroupItem>(
				group: Ref<ShopManagerGroup<T>>,
				item: T
			) {
				if (!group.value.items.includes(item)) {
					group.value.items.push(item);
				}
				return item;
			}

			let updatedModel: ShopManagerGroupItem | undefined = baseModel;

			if (response.resource) {
				switch (typename) {
					case 'Avatar_Frame':
						updatedModel = updateGroup(
							shopStore.avatarFrames,
							storeModel(AvatarFrameModel, response.resource)
						);
						break;
					case 'Background':
						updatedModel = updateGroup(
							shopStore.backgrounds,
							storeModel(BackgroundModel, response.resource)
						);
						break;
					case 'Sticker_Pack':
						updatedModel = updateGroup(
							shopStore.stickerPacks,
							storeModel(StickerPackModel, response.resource)
						);
						break;
					case 'Sticker':
						updatedModel = updateGroup(
							shopStore.stickers,
							storeModel(StickerModel, response.resource)
						);
						break;
				}
			}

			if (updatedModel) {
				const changeRequest = response.changeRequest
					? storeModel(CreatorChangeRequestModel, response.changeRequest)
					: null;
				const changeRequestKey = shopStore.getChangeRequestKey(updatedModel);

				if (changeRequest) {
					shopStore.changeRequests.value.set(changeRequestKey, changeRequest);
				} else {
					shopStore.changeRequests.value.delete(changeRequestKey);
				}
			}

			router.push({
				name: routeDashShopOverview.name,
			});
		},
	});

	// We'll assign to some Refs in here, so don't turn this into a computed.
	watch(
		[
			() => form.formModel.file,
			() => form.controlErrors.file,
			latestChangeRequest,
			existingImgUrl,
		],
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
		typename,
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
		paymentType,
		choosePaymentType(type: ShopProductPaymentType) {
			paymentType.value = type;
			form.reload();
		},
		changeRequest,
		rejectedChangeRequest,
		latestChangeRequest,
		getFieldAvailabilityUrl(field: keyof typeof initialFormModel.value) {
			const id = baseModel?.id || 0;
			const safeField = String(field);
			if (typename === 'Sticker_Pack') {
				return `/web/dash/creators/shop/packs/check-field-availability/${id}/${safeField}`;
			}
			return `/web/dash/creators/shop/collectibles/check-field-availability/${typename}/${id}/${safeField}`;
		},
		diffData: computed(() => {
			const before = !!baseModel && baseModel.was_approved;
			const after = !before || _compareFormDiff(initialFormModel.value);

			return {
				/**
				 * Intended for use with {@link AppShopProductDiff}
				 * dynamic-slots.
				 */
				binding: {
					before,
					after,
				},
				/**
				 * If there's a change between our {@link initialFormModel} and
				 * the {@link form.formModel}.
				 */
				hasChange: before === after,
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
	typename,
	isEditing,
	paymentType,
	choosePaymentType,
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
	diffData,
} = props.data;

const { avatarFrames, backgrounds, stickerPacks, stickers } = useShopManagerStore()!;

const premiumSelectorStyle: CSSProperties = {
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

const formControlBindings = computed<Partial<ComponentProps<typeof AppFormControl>>>(() => {
	// We don't want to show the label for the file field.
	let disabled = false;
	let group: ShopManagerGroup | null = null;
	switch (typename) {
		case 'Avatar_Frame':
			group = avatarFrames.value;
			break;
		case 'Background':
			group = backgrounds.value;
			break;
		case 'Sticker_Pack':
			group = stickerPacks.value;
			break;
		case 'Sticker':
			group = stickers.value;
			break;
	}

	// TODO(creator-shops) Make sure everything is disabled properly.
	if (paymentType.value === ShopProductPaymentType.Free) {
		disabled = group.canEditFree !== true;
	} else if (paymentType.value === ShopProductPaymentType.Premium) {
		disabled = group.canEditPremium !== true;
	}

	return {
		disabled,
	};
});
</script>

<template>
	<AppForm :controller="form">
		<template v-if="!paymentType">
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
						{{ $gettext(`Charge`) }}
					</div>
					<div>
						{{
							$gettext(
								`These are rewarded to users from charge sticker packs for placing charged stickers on your content. They can not be included in premium sticker packs. Static images only; they can't be animated.`
							)
						}}
					</div>
				</div>

				<div
					:style="premiumSelectorStyle"
					@click="choosePaymentType(ShopProductPaymentType.Premium)"
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
			<AppShopProductDiff :data="data" :dynamic-slots="diffData.binding">
				<template #before="binding">
					<slot name="diff" state="before" v-bind="binding" />
				</template>

				<template #after="binding">
					<slot name="diff" state="after" v-bind="binding" />
				</template>
			</AppShopProductDiff>

			<AppSpacer vertical :scale="4" />

			<AppFormGroup
				v-bind="formGroupBindings"
				name="file"
				:label="
					paymentType === ShopProductPaymentType.Premium
						? $gettext(`Upload animated image`)
						: $gettext(`Upload image`)
				"
				:optional="isEditing"
			>
				<div class="help-block">
					<div v-if="paymentType === ShopProductPaymentType.Premium">
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
						:page="productTypeFromTypename(typename)"
						class="link-help"
					>
						{{
							$gettext(`What are the shop product image requirements and guidelines?`)
						}}
					</AppLinkHelpDocs>
				</p>

				<AppFormControlUpload
					v-bind="formControlBindings"
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

			<AppFormGroup
				v-if="paymentType === ShopProductPaymentType.Premium || typename !== 'Sticker_Pack'"
				v-bind="formGroupBindings"
				name="name"
			>
				<AppFormControl
					v-bind="formControlBindings"
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

			<slot v-bind="{ formGroupBindings, formControlBindings }" />

			<AppFormStickySubmit
				v-if="form.valid && !formControlBindings.disabled"
				:style="{
					marginTop: kLineHeightComputed.px,
					// Fixes layering issues with some items.
					position: `relative`,
					zIndex: 2,
				}"
			>
				<AppFormButton>
					{{ $gettext(`Save & Submit`) }}
				</AppFormButton>
			</AppFormStickySubmit>

			<AppSpacer vertical :scale="10" />
		</template>
	</AppForm>
</template>
