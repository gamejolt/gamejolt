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
	toRef,
	watch,
} from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../../_common/background/background.model';
import AppButton from '../../../../../../_common/button/AppButton.vue';
import { ComponentProps } from '../../../../../../_common/component-helpers';
import { CreatorChangeRequestModel } from '../../../../../../_common/creator/change-request/creator-change-request.model';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import AppForm, {
	FormController,
	createForm,
} from '../../../../../../_common/form-vue/AppForm.vue';
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
import { InventoryShopProductSaleModel } from '../../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppJolticon from '../../../../../../_common/jolticon/AppJolticon.vue';
import AppLinkHelpDocs from '../../../../../../_common/link/AppLinkHelpDocs.vue';
import { showModalConfirm } from '../../../../../../_common/modal/confirm/confirm-service';
import { ModelStoreModel, storeModel } from '../../../../../../_common/model/model-store.service';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import {
	kThemeFg10,
	kThemeGjOverlayNotice,
	kThemePrimary,
	kThemePrimaryFg,
} from '../../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import {
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleFlexCenter,
} from '../../../../../../_styles/mixins';
import {
	kBorderWidthBase,
	kFontSizeLarge,
	kLineHeightComputed,
} from '../../../../../../_styles/variables';
import { objectOmit } from '../../../../../../utils/object';
import { isInstance, run } from '../../../../../../utils/utils';
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
import AppShopProductDiffImg from '../_diff/AppShopProductDiffImg.vue';
import AppShopProductDiffMeta from '../_diff/AppShopProductDiffMeta.vue';

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

	function _getFile(file: File | File[] | null | undefined) {
		if (!file) {
			return undefined;
		}
		return Array.isArray(file) ? file[0] : file;
	}

	const isEditing = Boolean(baseModel);

	const processedFileData = ref() as Ref<{ file: File; url: string } | undefined>;

	onUnmounted(() => {
		// Cleanup any temp image data we were using in the form.
		if (processedFileData.value) {
			(window.URL || window.webkitURL).revokeObjectURL(processedFileData.value.url);
			processedFileData.value = undefined;
		}
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

	const tempImgUrl = ref<string | null>(null);

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
				form.formModel.name = latestChange.change_name || form.formModel.name;
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
			// TODO(creator-shops) errors
			let message: string | null = null;

			showErrorGrowl(message || $gettext(`There was an error saving your product.`));
		},
		onSubmitSuccess(response) {
			function updateGroup<T extends ShopManagerGroupItem>(
				group: Ref<ShopManagerGroup<T>>,
				item: T
			) {
				if (!group.value.items.includes(item)) {
					group.value.items.push(item);
				}
			}

			if (response.resource) {
				switch (typename) {
					// TODO(creator-shops) Saving an insta-approved item doesn't
					// return the new fields.
					case 'Avatar_Frame':
						updateGroup(
							shopStore.avatarFrames,
							storeModel(AvatarFrameModel, response.resource)
						);
						break;
					case 'Background':
						updateGroup(
							shopStore.backgrounds,
							storeModel(BackgroundModel, response.resource)
						);
						break;
					case 'Sticker_Pack':
						updateGroup(
							shopStore.stickerPacks,
							storeModel(StickerPackModel, response.resource)
						);
						break;
					case 'Sticker':
						updateGroup(
							shopStore.stickers,
							storeModel(StickerModel, response.resource)
						);
						break;
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
			form.formModel.file = _getFile(file);
		},
		assignNonNull,
		isEditing,
		paymentType,
		choosePaymentType,
		changeRequest,
		rejectedChangeRequest,
		latestChangeRequest,
	});
}
</script>

<script lang="ts" setup>
const props = defineProps({
	data: {
		type: Object as PropType<ShopProductBaseForm>,
		required: true,
	},
	diffKeys: {
		type: Array as PropType<string[]>,
		default: () => [],
	},
});

// eslint-disable-next-line vue/no-setup-props-destructure
const {
	form,
	baseModel,
	typename,
	initialFormModel,
	isEditing,
	paymentType,
	choosePaymentType,
	setFile,
	existingImgUrl,
	tempImgUrl,
	changeRequest,
	rejectedChangeRequest,
	latestChangeRequest,
	minWidth,
	maxWidth,
	minHeight,
	maxHeight,
	aspectRatio,
	maxFilesize,
	minNameLength,
	maxNameLength,
} = props.data;

const diffKeys = toRef(props.diffKeys);

const { isSameValues } = useShopManagerStore()!;

const validateNameAvailabilityPath = computed(() => {
	// TODO(creator-shops) Name availability paths
	if (baseModel) {
		return `/web/dash/creators/stickers/check-field-availability/${baseModel.id}/name`;
	}
	return `/web/dash/creators/stickers/check-field-availability/0/name`;
});

async function setProductPublishState(publish: boolean) {
	if (!baseModel) {
		return;
	}

	const isStickerPack = isInstance(baseModel, StickerPackModel);
	let confirmText: string;
	if (publish) {
		if (isStickerPack && !baseModel.is_premium) {
			confirmText = $gettext(`Are you sure you want to enable this charge sticker pack?`);
		} else {
			confirmText = $gettext(`Are you sure you want to publish this product to the shop?`);
		}
	} else {
		if (isStickerPack && !baseModel.is_premium) {
			confirmText = $gettext(`Are you sure you want to disable this charge sticker pack?`);
		} else {
			confirmText = $gettext(`Are you sure you want to remove this product from the shop?`);
		}
	}

	const canContinue = await showModalConfirm(confirmText);
	if (!canContinue) {
		return;
	}

	let url: string;
	let postData: any = {};
	if (isStickerPack) {
		url = `/web/dash/creators/shop/packs/set-enabled`;
		postData = {
			pack_id: baseModel.id,
			is_enabled: publish,
		};
	} else if (publish) {
		url = `/web/dash/creators/shop/sales/create/${typename}/${baseModel.id}`;
	} else {
		url = `/web/dash/creators/shop/sales/remove/${typename}/${baseModel.id}`;
	}

	try {
		const response = await Api.sendRequest(url, postData, { detach: true });

		// TODO(creator-shops) The data returned doesn't include the actual shop
		// product fields that we use for this form:
		//
		// is_premium
		// has_active_sale
		// was_approved
		// is_active (free sticker packs only)
		//
		// We'll either need to manually update the models ourselves, reload the
		// form, or push a new overview route and force load it somehow so we
		// get the fresh data.
		//
		// If we'd doing any option other than the first one, we should lock the
		// publish/unpublish controls if there are modifications to the form
		// model.
		//
		// If we're locking the publish controls when there are modifications,
		// we need something better than just `form.changed` as it doesn't
		// un-dirty itself when fields are modified back to their original
		// values.
		if (isStickerPack && response.pack) {
			storeModel(StickerPackModel, response.pack);
		} else if (response.sale) {
			// TODO(creator-shops) Only returned when publishing.
			storeModel(InventoryShopProductSaleModel, response.sale);
		}
	} catch (e) {
		console.error(`Error processing publish state change.`, { publish }, e);
		showErrorGrowl($gettext(`Something went wrong. Please try again in a few minutes.`));
	}
}

async function cancelChangeRequest() {
	const changes = latestChangeRequest.value;
	if (!changes || changes.rejected_on) {
		return;
	}

	const canContinue = await showModalConfirm(
		$gettext(`Are you sure you want to cancel your pending change request?`)
	);
	if (!canContinue) {
		return;
	}

	try {
		// TODO(creator-shops) Doesn't appear to do anything when canceling a
		// change request for a product that isn't approved yet. Status changes,
		// but the change request is still there and the product is still
		// returned in the overview.
		const response = await Api.sendRequest(
			`/web/dash/creators/shop/change-requests/retract-submitted/${changes.id}`,
			{},
			{ detach: true }
		);

		if (response.request) {
			storeModel(CreatorChangeRequestModel, response.request);
			changeRequest.value = null;
			rejectedChangeRequest.value = null;
		}
	} catch (e) {
		console.error(`Error canceling pending change request.`, e);
		showErrorGrowl($gettext(`Something went wrong. Please try again in a few minutes.`));
	}
}

const premiumSelectorStyle: CSSProperties = {
	...styleBorderRadiusLg,
	...styleChangeBg('bg-offset'),
	padding: `24px`,
	border: `${kBorderWidthBase.px} solid ${kThemeFg10}`,
	flex: 1,
	cursor: `pointer`,
};

function makeStateBubbleStyles({
	backgroundColor = kThemePrimary,
}: { backgroundColor?: string } = {}) {
	return {
		...styleFlexCenter(),
		...styleElevate(1),
		borderRadius: `50%`,
		backgroundColor,
		padding: `4px`,
	};
}

function makeStateBubbleIconStyles({
	fontSize = kFontSizeLarge.px,
	color = kThemePrimaryFg,
}: {
	color?: string;
	fontSize?: string;
} = {}) {
	return {
		margin: 0,
		fontSize,
		color,
	};
}

const dynamicDiffSlots = computed(() => {
	const before = !!baseModel && baseModel.was_approved;
	return {
		before,
		after:
			!before ||
			Object.entries(initialFormModel.value).some(([key, val]) => {
				if (key === 'file' && form.controlErrors.file) {
					return false;
				}

				return !isSameValues(val, form.formModel[key]);
			}),
	};
});

function getExtraDiffData(target: typeof form.formModel) {
	return diffKeys.value.reduce((acc, key) => {
		if (Object.hasOwn(form.formModel, key)) {
			acc[key] = target[key];
		}
		return acc;
	}, {} as any);
}

const formGroupBindings: Partial<ComponentProps<typeof AppFormGroup>> & { style: CSSProperties } = {
	tinyLabelMargin: true,
	style: {
		marginBottom: kLineHeightComputed.px,
	},
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
		</AppExpand>

		<template v-if="!!paymentType">
			<AppShopProductDiff :dynamic-slots="dynamicDiffSlots">
				<template #before>
					<slot
						name="diff"
						state="before"
						:img-url="existingImgUrl"
						:model="initialFormModel"
					>
						<template v-if="baseModel && baseModel.was_approved">
							<AppShopProductDiffImg
								:typename="typename"
								:img-url="existingImgUrl"
								:style="{ marginBottom: `16px` }"
							/>
							<AppShopProductDiffMeta
								:current="{
									name: initialFormModel.name,
									...getExtraDiffData(initialFormModel),
								}"
							/>
						</template>
						<div v-else class="help-text">This item hasn't been approved yet.</div>
					</slot>
				</template>

				<template #after>
					<slot name="diff" state="after" :img-url="tempImgUrl" :model="form.formModel">
						<AppShopProductDiffImg
							:typename="typename"
							:img-url="tempImgUrl"
							:style="{ marginBottom: `16px` }"
						/>

						<div
							v-if="latestChangeRequest"
							:style="{
								position: `absolute`,
								top: `8px`,
								right: `8px`,
							}"
						>
							<div
								v-if="latestChangeRequest.rejected_on"
								v-app-tooltip.touchable="
									$gettext(`This item was rejected. Please submit a new version.`)
								"
								:style="
									makeStateBubbleStyles({
										backgroundColor: kThemeGjOverlayNotice,
									})
								"
							>
								<AppJolticon
									icon="exclamation"
									:style="makeStateBubbleIconStyles({ color: `white` })"
								/>
							</div>
							<div
								v-else-if="
									latestChangeRequest.added_on && !latestChangeRequest.approved_on
								"
								v-app-tooltip.touchable="
									$gettext(
										`This item is currently in review. You can still submit a new version for review, which will replace this.`
									)
								"
								:style="makeStateBubbleStyles()"
							>
								<AppJolticon icon="clock" :style="makeStateBubbleIconStyles()" />
							</div>
							<div
								v-else-if="latestChangeRequest.approved_on"
								v-app-tooltip.touchable="$gettext(`Available in the shop`)"
								:style="makeStateBubbleStyles()"
							>
								<AppJolticon
									icon="marketplace"
									:style="makeStateBubbleIconStyles()"
								/>
							</div>
						</div>

						<AppShopProductDiffMeta
							:current="{
								name: form.formModel.name || '',
								...getExtraDiffData(form.formModel),
							}"
							:other="initialFormModel"
							:diff-color="kThemePrimaryFg"
							:diff-background="kThemePrimary"
						/>
					</slot>
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
						(ratio of {{ (1 / aspectRatio) * aspectRatio }} ÷
						{{
							aspectRatio === 1
								? 1
								: Math.trunc((1 / (maxWidth / maxHeight)) * 100) / 100
						}}).
					</div>
				</div>

				<p class="help-block">
					<!-- TODO(creator-shops) help docs. -->
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
					fix-overflow
					@changed="setFile"
				/>

				<AppFormControlErrors :label="$gettext(`image`)" />
			</AppFormGroup>

			<AppFormGroup
				v-if="paymentType === ShopProductPaymentType.Premium || typename !== 'Sticker_Pack'"
				v-bind="formGroupBindings"
				name="name"
			>
				<AppFormControl
					:placeholder="$gettext(`Product name...`)"
					:validators="[
						validateMinLength(minNameLength),
						validateMaxLength(maxNameLength),
						// TODO(creator-shops) Fix this, it's not being reset properly when we update [name] during [onLoad].
						validateAvailability({
							initVal: baseModel?.name,
							url: validateNameAvailabilityPath,
						}),
					]"
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<slot v-bind="{ formGroupBindings }" />

			<!-- Publish/unpublish button -->
			<template
				v-if="baseModel && baseModel.was_approved && !isInstance(baseModel, StickerModel)"
			>
				<AppButton
					v-if="
						baseModel.has_active_sale ||
						(isInstance(baseModel, StickerPackModel) &&
							!baseModel.is_premium &&
							baseModel.is_active)
					"
					solid
					@click="setProductPublishState(false)"
				>
					<template
						v-if="isInstance(baseModel, StickerPackModel) && !baseModel.is_premium"
					>
						{{ $gettext(`Disable charge pack`) }}
					</template>
					<template v-else>
						{{ $gettext(`Remove from shop`) }}
					</template>
				</AppButton>
				<AppButton v-else solid primary @click="setProductPublishState(true)">
					<template
						v-if="isInstance(baseModel, StickerPackModel) && !baseModel.is_premium"
					>
						{{ $gettext(`Enable charge pack`) }}
					</template>
					<template v-else>
						{{ $gettext(`Publish to shop`) }}
					</template>
				</AppButton>
			</template>

			<!-- Cancel pending changes -->
			<template v-if="latestChangeRequest && !latestChangeRequest.rejected_on">
				<AppButton solid @click="cancelChangeRequest()">
					{{ $gettext(`Cancel pending changes`) }}
				</AppButton>
			</template>

			<AppFormStickySubmit
				v-if="form.valid"
				:style="{
					marginTop: kLineHeightComputed.px,
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
