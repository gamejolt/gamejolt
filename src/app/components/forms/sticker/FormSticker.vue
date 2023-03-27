<script lang="ts" setup>
import { computed, CSSProperties, onUnmounted, ref, Ref, toRaw, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppForm, {
	createForm,
	defineFormProps,
	FormController,
} from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlPrefix from '../../../../_common/form-vue/AppFormControlPrefix.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormStickySubmit from '../../../../_common/form-vue/AppFormStickySubmit.vue';
import AppFormControlToggle from '../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import AppFormControlUpload from '../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateAvailability,
	validateEmojiName,
	validateFilesize,
	validateImageAspectRatio,
	validateImageMaxDimensions,
	validateImageMinDimensions,
	validateMaxLength,
	validateMinLength,
} from '../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppLinkHelpDocs from '../../../../_common/link/AppLinkHelpDocs.vue';
import { ModelData, UnknownModelData } from '../../../../_common/model/model.service';
import { Screen } from '../../../../_common/screen/screen-service';
import { StickerPack } from '../../../../_common/sticker/pack/pack.model';
import { Sticker } from '../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	styleBorderRadiusCircle,
	styleBorderRadiusLg,
	styleChangeBg,
	styleFlexCenter,
} from '../../../../_styles/mixins';
import { kLineHeightComputed } from '../../../../_styles/variables';

type FormModel = Partial<Sticker> & {
	emoji_name: string;
};

const props = defineProps({
	...defineFormProps<Sticker>(),
	emojiPrefix: {
		type: String,
		default: '',
	},
	canActivate: {
		type: Boolean,
	},
});

const emit = defineEmits({
	changed: (_payloadSticker: UnknownModelData | ModelData<Sticker>) => true,
	pack: (_payloadPack: StickerPack | undefined) => true,
});

const { model, canActivate } = toRefs(props);

const emojiNameMinLength = ref(3);
const emojiNameMaxLength = ref(30);
const emojiPrefix = ref(props.emojiPrefix);

const minNameLength = ref(3);
const maxNameLength = ref(50);
const maxFilesize = ref(5 * 1024 * 1024);
const minSize = ref(100);
const maxSize = ref(400);
const aspectRatio = ref(1);

const loadUrl = computed(() => {
	if (model?.value) {
		return `/web/dash/creators/stickers/save/${model.value.id}`;
	}
	return `/web/dash/creators/stickers/save`;
});

const form: FormController<FormModel> = createForm({
	loadUrl,
	model: ref({
		...model?.value,
		is_active: false,
		emoji_name: model?.value?.emoji?.short_name || '',
	} as FormModel),
	onInit() {
		if (!model?.value) {
			form.formModel.is_active = canActivate?.value === true;
		} else {
			form.formModel.is_active = model.value.is_active === true;
		}
	},
	onLoad(payload) {
		minNameLength.value = payload.minNameLength ?? minNameLength.value;
		maxNameLength.value = payload.maxNameLength ?? maxNameLength.value;
		emojiNameMinLength.value = payload.emojiNameMinLength ?? emojiNameMinLength.value;
		emojiNameMaxLength.value = payload.emojiNameMaxLength ?? emojiNameMaxLength.value;

		maxFilesize.value = payload.maxFilesize ?? maxFilesize.value;
		minSize.value = payload.minSize ?? minSize.value;
		maxSize.value = payload.maxSize ?? maxSize.value;
		aspectRatio.value = payload.aspectRatio ?? aspectRatio.value;

		if (payload.sticker) {
			model?.value?.assign(payload.sticker);
			emojiPrefix.value = model?.value?.emoji?.prefix ?? emojiPrefix.value;
			form.formModel.emoji_name =
				model?.value?.emoji?.short_name ?? form.formModel.emoji_name;

			form.formModel.is_active = (model?.value?.is_active ?? payload.is_active) === true;
		}
	},
	onSubmit() {
		return Api.sendRequest(loadUrl.value, form.formModel, {
			detach: true,
			file: form.formModel.file,
		});
	},
	onSubmitError(response) {
		let message: string | null = null;

		const reason = response.reason;
		if (reason) {
			if (reason === 'max-sticker-amount-reached') {
				message = $gettext(
					`You've reached the limit of stickers you can add. You may edit any existing sticker you've created instead.`
				);
			}
		}

		showErrorGrowl(message || $gettext(`There was an error saving your sticker.`));
	},
	onSubmitSuccess(response) {
		emit('changed', response.sticker);
		emit('pack', response.pack ? new StickerPack(response.pack) : undefined);
	},
});

onUnmounted(() => {
	if (processedFileData.value) {
		(window.URL || window.webkitURL).revokeObjectURL(processedFileData.value.url);
		processedFileData.value = undefined;
	}
});

const processedFileData = ref() as Ref<{ file: File; url: string } | undefined>;
const imgUrl = computed(() => getImgUrl());
const canToggleActive = computed(() => {
	if (canActivate.value) {
		return true;
	}

	if (model?.value) {
		return model.value.is_active === true;
	}

	return false;
});

function getImgUrl(): string | undefined {
	if (model?.value) {
		return model.value.img_url;
	}

	// If we weren't provided a model to edit, try grabbing one from our file.
	const file = Array.isArray(form.formModel.file) ? form.formModel.file[0] : form.formModel.file;
	if (!file || form.controlErrors.file || toRaw(file) === toRaw(processedFileData.value?.file)) {
		return processedFileData.value?.url;
	}

	const windowUrl = window.URL || window.webkitURL;
	const oldImage = processedFileData.value?.url;
	processedFileData.value = { file, url: windowUrl.createObjectURL(file) };
	if (oldImage) {
		windowUrl.revokeObjectURL(oldImage);
	}
	return processedFileData.value.url;
}

function onFileUploadChanged() {
	if (form.formModel.file) {
		form.submit();
	}
}

const gridTemplateAreas: CSSProperties['gridTemplateAreas'] = `
		"a a a a a a b b b"
		"a a a a a a b b b"
		"a a a a a a b b b"
		"a a a a a a c c no-xs"
		"a a a a a a c c ."
		"a a a a a a . . ."
	`;

const gridStyles: CSSProperties = {
	display: `grid`,
	gap: `8px`,
	gridTemplateAreas,
	gridAutoColumns: `1fr`,
	gridAutoRows: `1fr`,
};

const stickerGridItems = computed(() => {
	const matches = gridTemplateAreas.match(/([\w|-]+)/g) || [];
	const items = new Set<string>();
	for (const item of matches) {
		// Xs breakpoint may show some grid items too small. Filter them out
		// from this builder for that breakpoint.
		if (Screen.isXs && item.startsWith('no-xs')) {
			continue;
		}
		items.add(item);
	}
	return items;
});

const validateNameAvailabilityPath = computed(() => {
	if (model?.value) {
		return `/web/dash/creators/stickers/check-field-availability/${model.value.id}/name`;
	}
	return `/web/dash/creators/stickers/check-field-availability/0/name`;
});

const validateEmojiAvailabilityPath = computed(() => {
	if (model?.value) {
		return `/web/dash/creators/stickers/check-field-availability/${model.value.id}/emojiName`;
	}
	return `/web/dash/creators/stickers/check-field-availability/0/emojiName`;
});
</script>

<template>
	<!-- FormSticker -->
	<AppForm :controller="form">
		<AppFormGroup name="is_active" :label="$gettext(`Enable sticker`)" tiny-label-margin>
			<AppFormControlToggle :disabled="!canToggleActive" />
		</AppFormGroup>

		<AppFormGroup
			name="file"
			:label="$gettext(`Upload your sticker`)"
			tiny-label-margin
			:optional="!!model"
		>
			<p v-translate class="help-block">Your sticker image must be a PNG.</p>
			<p
				v-translate="{
					min: `${minSize}×${minSize}`,
					max: `${maxSize}×${maxSize}`,
				}"
				class="help-block strong"
			>
				Sticker images must be between
				<code>%{min}</code>
				and
				<code>%{max}</code>
				(ratio of 1 ÷ 1).
			</p>

			<p class="help-block">
				<AppLinkHelpDocs category="creators" page="stickers" class="link-help">
					{{ $gettext(`What are the sticker image requirements and guidelines?`) }}
				</AppLinkHelpDocs>
			</p>

			<AppFormControlUpload
				:validators="[
					validateFilesize(maxFilesize),
					validateImageMinDimensions({ width: minSize, height: minSize }),
					validateImageMaxDimensions({ width: maxSize, height: maxSize }),
					validateImageAspectRatio({ ratio: aspectRatio }),
				]"
				accept=".png"
				fix-overflow
				@changed="onFileUploadChanged()"
			/>

			<AppFormControlErrors :label="$gettext(`sticker image`)" />
		</AppFormGroup>

		<AppFormGroup
			name="name"
			label="Sticker name"
			tiny-label-margin
			:style="{
				marginBottom: kLineHeightComputed.px,
			}"
		>
			<AppFormControl
				:placeholder="$gettext(`Sticker name...`)"
				:validators="[
					validateMinLength(minNameLength),
					validateMaxLength(maxNameLength),
					validateAvailability({ url: validateNameAvailabilityPath }),
				]"
			/>

			<AppFormControlErrors :label="$gettext(`sticker name`)" />
		</AppFormGroup>

		<AppFormGroup name="emoji_name" tiny-label-margin label="Emoji name">
			<AppFormControlPrefix :prefix="emojiPrefix || ''">
				<AppFormControl
					:placeholder="emojiPrefix ? undefined : $gettext(`Emoji name...`)"
					:validators="[
						validateMinLength(emojiNameMinLength),
						validateMaxLength(emojiNameMaxLength),
						validateEmojiName(),
						validateAvailability({ url: validateEmojiAvailabilityPath }),
					]"
				/>
			</AppFormControlPrefix>

			<AppFormControlErrors :label="$gettext(`emoji name`)" />
		</AppFormGroup>

		<label class="control-label">
			{{ $gettext(`Sticker preview`) }}
		</label>
		<div :style="gridStyles">
			<AppAspectRatio
				v-for="gridKey of stickerGridItems"
				:key="gridKey"
				:style="{
					gridArea: gridKey,
				}"
				:ratio="1"
			>
				<div
					:style="{
						...styleBorderRadiusLg,
						...styleChangeBg('bg-offset'),
						...styleFlexCenter(),
						width: `100%`,
						height: `100%`,
						padding: `8px`,
					}"
				>
					<div
						:style="{
							...styleFlexCenter(),
							width: `50%`,
							height: `50%`,
						}"
					>
						<img
							v-if="imgUrl"
							:style="{
								width: `100%`,
								height: `auto`,
								maxHeight: `100%`,
							}"
							:src="imgUrl"
							draggable="false"
							style="user-select: none"
							ondragstart="return false"
						/>
						<div
							v-else
							:style="{
								...styleBorderRadiusCircle,
								...styleChangeBg('bg-subtle'),
								width: `100%`,
								height: `100%`,
							}"
						/>
					</div>
				</div>
			</AppAspectRatio>
		</div>

		<AppFormStickySubmit
			:style="{
				marginTop: kLineHeightComputed.px,
			}"
		>
			<AppFormButton>
				{{ $gettext(`Save`) }}
			</AppFormButton>
		</AppFormStickySubmit>
	</AppForm>
</template>
