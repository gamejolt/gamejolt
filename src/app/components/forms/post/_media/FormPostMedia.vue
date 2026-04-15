<script lang="ts" setup>
import { computed, ref, useTemplateRef } from 'vue';
import draggable from 'vuedraggable';

import { Api, ApiProgressEvent } from '../../../../../_common/api/api.service';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlUpload, {
	AppFormControlUploadInterface,
} from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	validateFilesize,
	validateImageMaxDimensions,
} from '../../../../../_common/form-vue/validators';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { MediaItemModel } from '../../../../../_common/media-item/media-item-model';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormPostMediaItem from './item/FormPostMediaItem.vue';

type FormModel = {
	image: File[] | null;
	_progress: ApiProgressEvent | null;
};

type Props = {
	post: FiresidePostModel;
	maxFilesize: number;
	maxWidth: number;
	maxHeight: number;
	mediaItems: MediaItemModel[];
	loading?: boolean;
};

const { post, maxFilesize, maxWidth, maxHeight, mediaItems, loading } = defineProps<Props>();

const emit = defineEmits<{
	upload: [newMediaItems: MediaItemModel[]];
	error: [reason: string];
	sort: [mediaItems: MediaItemModel[]];
	remove: [mediaItem: MediaItemModel];
}>();

const isDropActive = ref(false);

const uploadRef = useTemplateRef<AppFormControlUploadInterface>('upload');

const isLoading = computed(() => form.isProcessing || loading);

const internalItems = computed({
	get: () => mediaItems,
	set: (val: MediaItemModel[]) => emit('sort', val),
});

const form: FormController<FormModel> = createForm<FormModel>({
	resetOnSubmit: true,
	onInit() {
		form.formModel.image = null;
	},
	async onSubmit() {
		return Api.sendRequest(
			`/web/posts/manage/add-media/${post.id}`,
			{},
			{
				file: form.formModel.image,
				progress: e => (form.formModel._progress = e),
			}
		);
	},
	onSubmitSuccess(response: any) {
		uploadRef.value?.clearAllFiles();
		emit('upload', MediaItemModel.populate(response.mediaItems));
	},
	onSubmitError(response: any) {
		uploadRef.value?.clearAllFiles();
		emit('error', response.reason);
	},
});

function mediaSelected() {
	if (form.formModel.image !== null) {
		form.submit();
	}
}

function showSelectMedia() {
	uploadRef.value?.showFileSelect();
}

function onDragOver(e: DragEvent) {
	// Don't do anything if not a file drop.
	if (
		!e.dataTransfer ||
		!e.dataTransfer.items.length ||
		e.dataTransfer.items[0].kind !== 'file'
	) {
		return;
	}

	e.preventDefault();
	isDropActive.value = true;
}

function onDragLeave() {
	isDropActive.value = false;
}

// File select resulting from a drop onto the input.
async function onDrop(e: DragEvent) {
	// Don't do anything if not a file drop.
	if (
		!e.dataTransfer ||
		!e.dataTransfer.items.length ||
		e.dataTransfer.items[0].kind !== 'file'
	) {
		return;
	}

	e.preventDefault();
	isDropActive.value = false;
	uploadRef.value?.drop(e);
}
</script>

<template>
	<AppLoadingFade :is-loading="isLoading">
		<AppForm :controller="form">
			<AppFormGroup
				name="image"
				class="sans-margin-bottom"
				hide-label
				optional
				:label="$gettext(`Image`)"
			>
				<p class="help-block">
					<AppTranslate>Your image must be a PNG, JPG, or GIF.</AppTranslate>
					<br />
					<b><AppTranslate>Animated GIFs are supported.</AppTranslate></b>
				</p>

				<AppScrollScroller horizontal thin>
					<div
						class="-items"
						@dragover="onDragOver($event)"
						@dragleave="onDragLeave()"
						@drop="onDrop($event)"
					>
						<a
							class="-add"
							:class="{
								'-drop-active': isDropActive,
							}"
							@click="showSelectMedia()"
						>
							<div class="-add-inner">
								<div>
									<AppJolticon icon="add" big />
									<br />
									<b>
										<AppTranslate>Images/GIFs</AppTranslate>
									</b>
								</div>
							</div>
						</a>

						<draggable
							v-model="internalItems"
							style="display: inline-flex"
							v-bind="{ delay: 100, delayOnTouchOnly: true }"
							item-key="id"
						>
							<template #item="{ element }">
								<div class="-item">
									<AppFormPostMediaItem
										:item="element"
										@remove="emit('remove', element)"
									/>
								</div>
							</template>
						</draggable>
					</div>
				</AppScrollScroller>

				<AppFormControlUpload
					ref="upload"
					class="-upload-input"
					:validators="[
						validateFilesize(maxFilesize),
						validateImageMaxDimensions({ width: maxWidth, height: maxHeight }),
					]"
					accept=".png,.jpg,.jpeg,.gif,.webp"
					multiple
					@changed="mediaSelected()"
				/>

				<AppFormControlErrors />
			</AppFormGroup>
		</AppForm>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
@import './variables'

.-items
	white-space: nowrap
	// Only put padding once so that it only pads the bottom.
	height: $-padding + $-height

.-item
	margin-right: 20px

	&:last-child
		margin-right: 0

.-add
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	display: inline-block
	vertical-align: top
	text-align: center
	border-width: 2px
	border-style: dashed
	margin-right: $-padding
	transition: border-color 0.1s ease

	&:hover
	&.-drop-active
		theme-prop('border-color', 'link')
		theme-prop('color', 'link')

	&.-drop-active
		border-style: solid

.-add-inner
	display: flex
	align-items: center
	justify-content: center
	width: $-height
	height: $-height

.-upload-input
	display: none
</style>
