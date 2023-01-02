<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';
import { Api } from '../../../api/api.service';
import AppButton from '../../../button/AppButton.vue';
import { Clipboard } from '../../../clipboard/clipboard-service';
import { MediaItem } from '../../../media-item/media-item-model';
import { vAppTooltip } from '../../../tooltip/tooltip-directive';
import AppTranslate from '../../../translate/AppTranslate.vue';
import { $gettext } from '../../../translate/translate.service';
import AppForm, { createForm, defineFormProps, FormController } from '../../AppForm.vue';
import AppFormControlErrors from '../../AppFormControlErrors.vue';
import AppFormGroup from '../../AppFormGroup.vue';
import { validateFilesize, validateImageMaxDimensions } from '../../validators';
import AppFormControlUpload from '../upload/AppFormControlUpload.vue';

interface FormModel {
	type: string;
	parent_id: number;
	image: File | null;
	_progress: ProgressEvent | null;
}

const props = defineProps({
	...defineFormProps<FormModel>(),
	type: {
		type: String,
		required: true,
	},
	parentId: {
		type: Number,
		required: true,
	},
	disabled: {
		type: Boolean,
	},
});

const mediaItems = ref([] as MediaItem[]);
const maxFilesize = ref(0);
const maxWidth = ref(0);
const maxHeight = ref(0);

const form: FormController<FormModel> = createForm({
	model: toRef(props, 'model'),
	loadUrl: `/web/dash/media-items`,
	loadData: computed(() => form.formModel),
	reloadOnSubmit: true,
	onInit() {
		form.formModel['type'] = props.type;
		form.formModel['parent_id'] = props.parentId;
		form.formModel['image'] = null;
	},
	onLoad(response) {
		mediaItems.value = MediaItem.populate(response.mediaItems);
		maxFilesize.value = response.maxFilesize;
		maxWidth.value = response.maxWidth;
		maxHeight.value = response.maxHeight;
	},
	async onSubmit() {
		return Api.sendRequest('/web/dash/media-items/add', form.formModel, {
			file: form.formModel.image,
			progress: e => {
				form.formModel['_progress'] = e;
			},
		});
	},
	onSubmitSuccess(response) {
		if (Array.isArray(response.mediaItems)) {
			for (const mediaItem of response.mediaItems) {
				mediaItems.value.unshift(new MediaItem(mediaItem));
			}
		}
	},
});

function imageSelected() {
	form.submit();
}

function copyLink(mediaItem: MediaItem) {
	Clipboard.copy(
		'![](' + mediaItem.img_url.replace(/ /g, '+') + ')',
		$gettext(`You can now paste this image in your content.`)
	);
}
</script>

<template>
	<div v-if="mediaItems.length || !disabled" class="form-markdown-editor-media-items well">
		<template v-if="mediaItems.length">
			<p class="small text-muted">
				<AppTranslate>
					To use these images in your content, copy the embed code by clicking on the
					"link" button for the image, and then paste it where you want in your content.
				</AppTranslate>
			</p>

			<div class="media-item-list scrollable scrollable-x">
				<div v-for="item of mediaItems" :key="item.id" class="media-item-list-col">
					<div class="media-item-list-item">
						<div class="media-item-list-item-inner">
							<div class="media-item-list-item-controls theme-dark">
								<AppButton
									v-app-tooltip="$gettext(`Copy Markdown Embed`)"
									icon="link"
									overlay
									sparse
									@click="copyLink(item)"
								/>
							</div>

							<span
								class="media-item-list-item-img"
								:style="{ 'background-image': `url('${item.img_url}')` }"
							/>
						</div>
					</div>
				</div>
			</div>
		</template>

		<template v-if="!disabled">
			<br />
			<AppForm :controller="form">
				<AppFormGroup name="image" hide-label optional>
					<AppFormControlUpload
						:validators="[
							validateFilesize(maxFilesize),
							validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
						]"
						accept=".png,.jpg,.jpeg,.gif"
						:upload-link-label="
							$gettext(`Upload a PNG, JPG, or GIF image for use in the content.`)
						"
						multiple
						@changed="imageSelected()"
					/>

					<AppFormControlErrors />
				</AppFormGroup>
			</AppForm>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.form-markdown-editor-media-items
	change-bg('bg')
	theme-prop('border-color', 'bg-subtle')
	border-width: 2px
	border-style: solid
	border-top: 0
	border-top-left-radius: 0
	border-top-right-radius: 0
	margin-bottom: 0 // Get rid of the bottom margin from 'well' styling.

	::v-deep(.form-group)
		margin-bottom: 0

	.media-item-list
		white-space: nowrap
		margin: 0 -10px

		&-col
			display: inline-block
			width: 40%
			max-width: 200px
			padding: 0 10px

		&-item
			rounded-corners-lg()
			change-bg('fg')
			display: block
			position: relative
			padding-top: 80%
			height: 0

			@media $media-xs
				margin-bottom: $grid-gutter-width-xs

		&-item-inner
			position: absolute
			top: 3px
			right: 3px
			bottom: 3px
			left: 3px

		&-item-controls
			position: absolute
			top: 3px
			right: 3px
			z-index: 1

		&-item-img
			rounded-corners-lg()
			position: absolute
			top: 0
			right: 0
			bottom: 0
			left: 0
			background-repeat: no-repeat
			background-position: center center
			background-size: cover
</style>
