<script lang="ts">
import {
	PropType,
	Ref,
	computed,
	onUnmounted,
	ref,
	shallowReadonly,
	shallowRef,
	toRaw,
	toRefs,
} from 'vue';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import { CreatorChangeRequestModel } from '../../../../../_common/creator/change-request/creator-change-request.model';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateAvailability,
	validateFilesize,
	validateImageAspectRatio,
	validateImageMaxDimensions,
	validateImageMinDimensions,
	validateMaxLength,
	validateMinLength,
} from '../../../../../_common/form-vue/validators';
import AppLinkHelpDocs from '../../../../../_common/link/AppLinkHelpDocs.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { kLineHeightComputed } from '../../../../../_styles/variables';
import AppDashShopItemImg from '../AppDashShopItemImg.vue';
import { ShopManagerGroupItem, ShopManagerGroupItemType } from '../RouteDashShop.vue';
import AppShopProductDiff from './AppShopProductDiff.vue';

interface BaseFields {
	name: string;
	description: string | undefined;
	img_url: string;
	artist: string;
	file: File | undefined;
}

type ShopProductFields<T extends Record<string, any>> = BaseFields & T;

type BaseShopProductForm = ReturnType<typeof createBaseShopProductForm>;

export function createBaseShopProductForm<
	T extends Partial<BaseFields>,
	V extends ShopManagerGroupItem
>({
	id,
	typename,
	isPremium,
	toEdit,
	fields = {} as T,
}: {
	id: number | undefined;
	typename: ShopManagerGroupItemType;
	isPremium: boolean;
	toEdit: V | undefined;
	fields?: T;
}) {
	const existingModel = shallowRef(toEdit || null);
	const model = ref<ShopProductFields<T>>({
		name: '',
		description: undefined,
		img_url: '',
		artist: '',
		file: undefined,
		...fields,
	});

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

	const imgUrl = computed(() => {
		if (model?.value) {
			return model.value.img_url;
		}

		// If we weren't provided a model to edit, try grabbing one from our
		// file.
		const file = _getFile(model.value.file);
		if (
			!file ||
			// form.controlErrors.file ||
			toRaw(file) === toRaw(processedFileData.value?.file)
		) {
			return processedFileData.value?.url;
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

	function assignNonNull<T>(field: Ref<T>, value: T | null | undefined) {
		if (value !== undefined && value !== null) {
			field.value = value;
		}
	}

	function onLoad(payload: any) {
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

		if (payload.resource) {
			// TODO(creator-shops) storeModel or something on the resource.
			switch (typename) {
				case 'Avatar_Frame': {
					const newModel = new AvatarFrameModel(payload.resource);
					existingModel.value = newModel as V;
					model.value.img_url = newModel.image_url;
					break;
				}
				case 'Background': {
					const newModel = new BackgroundModel(payload.resource);
					existingModel.value = newModel as V;
					model.value.img_url = newModel.media_item.is_animated
						? newModel.media_item.img_url
						: newModel.media_item.mediaserver_url;
					break;
				}
				case 'Sticker_Pack': {
					const newModel = new StickerPackModel(payload.resource);
					existingModel.value = newModel as V;
					model.value.img_url = newModel.media_item.mediaserver_url;
					break;
				}
				case 'Sticker': {
					const newModel = new StickerModel(payload.resource);
					existingModel.value = newModel as V;
					model.value.img_url = newModel.img_url;
					break;
				}
			}

			// controller.addItem(existingModel.value);
		}
	}

	return shallowReadonly({
		typename,
		existingModel,
		model,

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
		imgUrl,
		isEditing: computed(() => !!existingModel.value),
		setFile(file: File | File[] | null | undefined) {
			model.value.file = _getFile(file);
		},
		loadUrl: computed(() => {
			let result = `/web/dash/creators/shop/collectibles/save/${typename}`;
			if (id) {
				result += `/${id}`;
			}
			return result + `?is_premium=${isPremium}`;
		}),
		assignNonNull,
		onLoad,
	});
}
</script>

<script lang="ts" setup>
const props = defineProps({
	data: {
		type: Object as PropType<BaseShopProductForm>,
		required: true,
	},
});

const { data } = toRefs(props);

const form = useForm<BaseFields>()!;

const validateNameAvailabilityPath = computed(() => {
	// if (model?.value) {
	// 	return `/web/dash/creators/stickers/check-field-availability/${model.value.id}/name`;
	// }
	return `/web/dash/creators/stickers/check-field-availability/0/name`;
});

// TODO(creator-shops) remove
const useDebugData = true;
</script>

<template>
	<AppShopProductDiff>
		<template #before>
			<AppDashShopItemImg :typename="data.typename" :img-url="data.model.value.img_url" />
		</template>

		<template #after>
			<AppDashShopItemImg :typename="data.typename" :img-url="data.imgUrl.value" />
		</template>
	</AppShopProductDiff>

	<AppFormGroup
		name="file"
		:label="$gettext(`Upload your image`)"
		tiny-label-margin
		:optional="data.isEditing.value"
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
				{{ $gettext(`What are the shop product image requirements and guidelines?`) }}
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
			@changed="data.setFile"
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

	<slot name="bottom-controls" />

	<AppFormStickySubmit
		:style="{
			marginTop: kLineHeightComputed.px,
		}"
	>
		<AppFormButton>
			{{ $gettext(`Save`) }}
		</AppFormButton>
	</AppFormStickySubmit>
</template>
