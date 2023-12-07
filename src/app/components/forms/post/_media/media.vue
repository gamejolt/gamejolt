<script lang="ts">
import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import { Api, ApiProgressEvent } from '../../../../../_common/api/api.service';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import AppFormControlUpload, {
	AppFormControlUploadInterface,
} from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { MediaItemModel } from '../../../../../_common/media-item/media-item-model';
import AppScrollScroller from '../../../../../_common/scroll/AppScrollScroller.vue';
import AppFormPostMediaItem from './item/item.vue';

interface FormModel {
	image: File[] | null;
	_progress: ApiProgressEvent | null;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		draggable,
		AppScrollScroller,
		AppImgResponsive,
		AppFormPostMediaItem,
		AppFormControlUpload,
		AppLoadingFade,
	},
})
export default class AppFormPostMedia
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess, FormOnSubmitError
{
	@Prop({ type: Object })
	post!: FiresidePostModel;

	@Prop(Number)
	maxFilesize!: number;

	@Prop(Number)
	maxWidth!: number;

	@Prop(Number)
	maxHeight!: number;

	@Prop(Array)
	mediaItems!: MediaItemModel[];

	@Prop(Boolean)
	loading?: boolean;

	isDropActive = false;

	declare $refs: {
		upload: AppFormControlUploadInterface;
	};

	@Emit('upload')
	emitUpload(_newMediaItems: MediaItemModel[]) {}

	@Emit('error')
	emitError(_reason: string) {}

	@Emit('sort')
	emitSort(_mediaItems: MediaItemModel[]) {}

	@Emit('remove')
	emitRemove(_mediaItem: MediaItemModel) {}

	get isLoading() {
		return this.form.isProcessing || this.loading;
	}

	get internalItems() {
		return this.mediaItems;
	}

	set internalItems(mediaItems: MediaItemModel[]) {
		this.emitSort(mediaItems);
	}

	created() {
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('image', null);
	}

	mediaSelected() {
		if (this.formModel.image !== null) {
			this.form.submit();
		}
	}

	showSelectMedia() {
		this.$refs.upload?.showFileSelect();
	}

	onDragOver(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file'
		) {
			return;
		}

		e.preventDefault();
		this.isDropActive = true;
	}

	onDragLeave() {
		this.isDropActive = false;
	}

	// File select resulting from a drop onto the input.
	async onDrop(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file'
		) {
			return;
		}

		e.preventDefault();
		this.isDropActive = false;
		this.$refs.upload?.drop(e);
	}

	async onSubmit() {
		return Api.sendRequest(
			`/web/posts/manage/add-media/${this.post.id}`,
			{},
			{
				file: this.formModel.image,
				progress: e => this.setField('_progress', e),
			}
		);
	}

	onSubmitSuccess(response: any) {
		this.$refs.upload?.clearAllFiles();
		this.emitUpload(MediaItemModel.populate(response.mediaItems));
	}

	onSubmitError(response: any) {
		this.$refs.upload?.clearAllFiles();
		this.emitError(response.reason);
	}
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
										@remove="emitRemove(element)"
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
