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
import AppAlertBox from '../../../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../../../_common/avatar/frame.model';
import {
	BackgroundDefaultScale,
	BackgroundModel,
	BackgroundScaling,
	getBackgroundCSSProperties,
} from '../../../../../../_common/background/background.model';
import { ComponentProps } from '../../../../../../_common/component-helpers';
import {
	CreatorChangeRequestModel,
	CreatorChangeRequestStatus,
} from '../../../../../../_common/creator/change-request/creator-change-request.model';
import { formatFilesize } from '../../../../../../_common/filters/filesize';
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
import AppLinkHelp from '../../../../../../_common/link/AppLinkHelp.vue';
import { ModelStoreModel, storeModel } from '../../../../../../_common/model/model-store.service';
import {
	ShopProductModel,
	ShopProductResource,
} from '../../../../../../_common/shop/product/product-model';
import AppSpacer from '../../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../../_common/sticker/sticker.model';
import {
	kThemeBgOffset,
	kThemeFg10,
	kThemeGjOverlayNotice,
} from '../../../../../../_common/theme/variables';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg, styleChangeBg } from '../../../../../../_styles/mixins';
import { kBorderRadiusBase, kBorderWidthBase } from '../../../../../../_styles/variables';
import { arrayRemove, arrayUnique, numberSort } from '../../../../../../utils/array';
import { objectOmit } from '../../../../../../utils/object';
import { assertNever, isInstance, run } from '../../../../../../utils/utils';
import { routeDashShopOverview } from '../../overview/overview.route';
import {
	ShopDashGroup,
	ShopDashProductType,
	ShopDashStore,
	getShopDashProductType,
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
	const dashGroup = toRef(() => shopStore.getGroupForResource(resource));

	const productType = ref<ShopDashProductType>();
	if (baseModel) {
		productType.value = getShopDashProductType(baseModel);
	} else if (resource === ShopProductResource.Sticker) {
		// For stickers we want to allow them to choose, unless they can't edit
		// the particular types, in which case we want to choose for them.
		if (!dashGroup.value.canEditFree) {
			// This would be weird, but whatever.
			productType.value = ShopDashProductType.Premium;
		} else if (!dashGroup.value.canEditPremium) {
			productType.value = ShopDashProductType.Basic;
		}
	} else {
		// For other product types, you can currently only add premium.
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

	const backgroundDefaultScaling = ref(BackgroundScaling.tile);
	const backgroundDefaultScale = ref(BackgroundDefaultScale);

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

			assignNonNull(backgroundDefaultScaling, payload.backgroundDefaultScaling);
			assignNonNull(backgroundDefaultScale, payload.backgroundDefaultScale);

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
				if (!baseModel?.was_approved) {
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

				// Update published state for stickers added/removed from free
				// packs.
				if (resource === ShopProductResource.StickerPack && !updatedModel.is_premium) {
					const oldIds = initialFormModel.value.stickers;
					const newIds = Object.hasOwn(form.formModel, 'stickers')
						? form.formModel.stickers
						: [];

					const packContents =
						shopStore.stickerPackContents.value.get(updatedModel.id) || [];
					// Remove any stickers that aren't in the pack from our pack
					// contents array.
					if (packContents.length) {
						for (const id of oldIds) {
							if (newIds.includes(id)) {
								continue;
							}
							arrayRemove(packContents, i => i === id);
						}
					}

					// Add new sticker ids to our pack contents.
					if (newIds.length) {
						for (const id of newIds) {
							if (oldIds.includes(id)) {
								continue;
							}
							packContents.push(id);
						}
						shopStore.stickerPackContents.value.set(
							updatedModel.id,
							arrayUnique(packContents)
						);
					}
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
		dashGroup,

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
		getBackgroundSize(data?: BaseModel | string) {
			let styles = {
				backgroundRepeat: 'repeat',
				backgroundImage: ``,
				backgroundPosition: 'center',
				backgroundSize: '100% 100%',
			} satisfies ReturnType<typeof getBackgroundCSSProperties>;

			let tileSize: { width: number; height: number } | null = null;

			if (isInstance(data, BackgroundModel)) {
				styles = getBackgroundCSSProperties(data);
				if (data.scaling === BackgroundScaling.tile) {
					tileSize = {
						width: data.media_item.croppedWidth / data.scale,
						height: data.media_item.croppedHeight / data.scale,
					};
				}
			} else {
				styles.backgroundImage = `url(${data})`;

				if (backgroundDefaultScaling.value === BackgroundScaling.tile) {
					const getSize = (min: number, max: number) => {
						let size = min;
						if (min !== max) {
							size = (min + max) / 2;
						}
						return size / backgroundDefaultScale.value;
					};
					tileSize = {
						width: getSize(minWidth.value, maxWidth.value),
						height: getSize(minHeight.value, maxHeight.value),
					};
					styles.backgroundSize = `${tileSize.width}px ${tileSize?.height}px`;
				} else {
					styles.backgroundRepeat = 'no-repeat';
				}
			}

			// We always want to position tiled images so that there's a bit of
			// tiling on the top and the left. This is because we want to show
			// the user that the image will tile.
			if (tileSize) {
				styles.backgroundPosition = 'center';
			}

			return {
				tileSize,
				styles,
			};
		},
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
	dashGroup,
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
	changeRequest,
} = props.data;

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
		marginBottom: `30px`,
	},
};

// The below are kind of weird states of not being able to edit things that
// you've set up. We need them here for slow rollout.
const isUneditableFree = computed(
	() => productType.value !== ShopDashProductType.Premium && !dashGroup.value.canEditFree
);

const isUneditablePremium = computed(
	() => productType.value === ShopDashProductType.Premium && !dashGroup.value.canEditPremium
);

const isPremiumApproved = computed(
	() => productType.value === ShopDashProductType.Premium && baseModel?.was_approved === true
);

// Basically, if none of the states above are set, then we can edit the product.
const canEdit = computed(
	() => (isUneditableFree.value || isUneditablePremium.value || isPremiumApproved.value) === false
);

const helpDocLink = computed(() => {
	switch (resource) {
		case ShopProductResource.AvatarFrame:
			return 'avatar-frames';
		case ShopProductResource.Background:
			return 'backgrounds';
		case ShopProductResource.StickerPack:
			return 'stickers';
		case ShopProductResource.Sticker:
			return 'stickers';
		default:
			assertNever(resource);
	}
});

const isAnimated = computed(
	() =>
		// Sticker packs are not animated no matter what right now.
		resource !== ShopProductResource.StickerPack &&
		productType.value === ShopDashProductType.Premium
);
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
					@click="chooseProductType(ShopDashProductType.Premium)"
				>
					<div :style="{ fontWeight: `bold` }">
						{{ $gettext(`Premium`) }}
					</div>
					<div>
						{{
							$gettext(
								`You can sell premium stickers within premium packs in your shop for joltbux to make money from your supporters. Just remember, they must be animated, go through an approval process, and can't be added to reward packs.`
							)
						}}
					</div>
				</div>

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
								`Supporters who place charged stickers on your content get a reward pack with basic stickers as a thank-you gesture. Basic stickers within reward packs cannot be sold for joltbux, can't go in premium packs, and must be static images without animations.`
							)
						}}
					</div>
				</div>
			</div>

			<div>
				<h4>{{ $gettext(`FAQ`) }}</h4>
				<div>
					<AppLinkHelp page="stickers">
						{{ $gettext(`Stickers and Sticker Packs`) }}
					</AppLinkHelp>
				</div>
				<div>
					<AppLinkHelp page="getting-paid">
						{{ $gettext(`Charged stickers`) }}
					</AppLinkHelp>
				</div>
				<div>
					<AppLinkHelp page="shop">
						{{ $gettext(`Shop`) }}
					</AppLinkHelp>
				</div>
			</div>
		</template>
		<template v-else>
			<template v-if="!canEdit">
				<!-- All of these states should be the reason they can't edit. -->
				<template v-if="isUneditableFree">
					<AppAlertBox fill-color="offset" icon="notice">
						{{ $gettext(`You are currently unable to edit free products.`) }}
					</AppAlertBox>
				</template>
				<template v-else-if="isUneditablePremium">
					<AppAlertBox fill-color="offset" icon="notice">
						{{ $gettext(`You are currently unable to edit premium products.`) }}
					</AppAlertBox>
				</template>
				<template v-else-if="isPremiumApproved">
					<AppAlertBox fill-color="offset" icon="info-circle">
						{{
							$gettext(
								`This premium product has been approved. You're no longer able to modify it.`
							)
						}}
					</AppAlertBox>
				</template>

				<AppSpacer vertical :scale="6" />
			</template>

			<template v-if="changeRequest?.status === CreatorChangeRequestStatus.Rejected">
				<div
					:style="{
						backgroundColor: kThemeBgOffset,
						borderRadius: kBorderRadiusBase.px,
						border: `${kBorderWidthBase.px} solid ${kThemeGjOverlayNotice}`,
						padding: `24px`,
						fontWeight: `bold`,
					}"
				>
					<template v-if="!changeRequest.rejection_message">
						{{ $gettext(`The latest changes were rejected.`) }}
					</template>
					<template v-else>
						<div :style="{ marginBottom: `8px` }">
							{{
								$gettext(
									`The latest changes were rejected with the following reason:`
								)
							}}
						</div>
						<div
							:style="{
								whiteSpace: `pre-wrap`,
								fontWeight: `normal`,
							}"
						>
							{{ changeRequest.rejection_message }}
						</div>
					</template>

					<div :style="{ marginTop: `8px` }">
						{{ $gettext(`Please fix the issues and submit again.`) }}
					</div>
				</div>

				<AppSpacer vertical :scale="6" />
			</template>

			<AppShopProductDiff :data="data" />

			<AppSpacer vertical :scale="4" />

			<template v-if="canEdit">
				<AppFormGroup
					v-bind="formGroupBindings"
					name="file"
					:label="
						isAnimated ? $gettext(`Upload animated image`) : $gettext(`Upload image`)
					"
					:optional="isEditing"
				>
					<div class="help-block">
						<div v-if="isAnimated">
							{{ $gettext(`Your image must be an animated PNG (APNG).`) }}
						</div>
						<div v-else>{{ $gettext(`Your image must be a PNG.`) }}</div>

						<div v-if="minWidth === maxWidth && minHeight === maxHeight">
							{{
								$gettext(
									`Images must be %{ dimensions } (ratio of 1 ÷ %{ denominator }).`,
									{
										dimensions: `${minWidth}×${minHeight}`,
										denominator:
											aspectRatio === 1
												? 1
												: Math.trunc((1 / (maxWidth / maxHeight)) * 100) /
												  100,
									}
								)
							}}
						</div>
						<div v-else>
							{{
								$gettext(
									`Images must be between %{ min } and %{ max } (ratio of 1 ÷ %{ denominator }).`,
									{
										min: `${minWidth}×${minHeight}`,
										max: `${maxWidth}×${maxHeight}`,
										denominator:
											aspectRatio === 1
												? 1
												: Math.trunc((1 / (maxWidth / maxHeight)) * 100) /
												  100,
									}
								)
							}}
						</div>

						<div>
							{{
								$gettext(`Max filesize is %{ filesize }.`, {
									filesize: formatFilesize(maxFilesize),
								})
							}}
						</div>
					</div>

					<div class="help-block">
						<AppLinkHelp :page="helpDocLink" class="link-help">
							{{
								$gettext(
									`What are the shop product image requirements and guidelines?`
								)
							}}
						</AppLinkHelp>
					</div>

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
									`This product must be animated. Please upload an animated APNG file.`
								)
							"
						/>
						<AppFormControlError
							when="file:missing-required-static-image"
							:message="
								$gettext(
									`This product must be a static image. Please upload a plain PNG file.`
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
					<div class="help-block">
						{{
							$gettext(
								`Give your product a name to keep things organized. These names will show in people's Joltydex and as such must follow our Site Guidelines.`
							)
						}}
						<AppLinkHelp page="site-guidelines" class="link-help">
							{{ $gettext(`Read our Site Guidelines.`) }}
						</AppLinkHelp>
					</div>

					<AppFormControl
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
