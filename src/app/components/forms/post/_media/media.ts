import View from '!view!./media.html?style=./media.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppFormControlUpload } from 'game-jolt-frontend-lib/components/form-vue/control/upload/upload';
import { AppForm } from 'game-jolt-frontend-lib/components/form-vue/form';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { AppLoadingFade } from 'game-jolt-frontend-lib/components/loading/fade/fade';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { AppScrollScroller } from 'game-jolt-frontend-lib/components/scroll/scroller/scroller';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppFormPostMediaItem } from './item/item';

const draggable = require('vuedraggable');

interface FormModel {
	image: File[] | null;
	_progress: ProgressEvent | null;
}

@View
@Component({
	components: {
		draggable,
		AppScrollScroller,
		AppImgResponsive,
		AppFormPostMediaItem,
		AppFormControlUpload,
		AppLoadingFade,
	},
})
export class AppFormPostMedia extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnSubmitSuccess {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Number)
	maxFilesize!: number;

	@Prop(Number)
	maxWidth!: number;

	@Prop(Number)
	maxHeight!: number;

	@Prop(Array)
	mediaItems!: MediaItem[];

	@Prop(Boolean)
	loading?: boolean;

	resetOnSubmit = true;
	isDropActive = false;

	$refs!: {
		form: AppForm;
		upload: AppFormControlUpload;
	};

	@Emit('upload')
	emitUpload(_newMediaItems: MediaItem[]) {}

	@Emit('sort')
	emitSort(_mediaItems: MediaItem[]) {}

	@Emit('remove')
	emitRemove(_mediaItem: MediaItem) {}

	get isLoading() {
		return this.state.isProcessing || this.loading;
	}

	get internalItems() {
		return this.mediaItems;
	}

	set internalItems(mediaItems: MediaItem[]) {
		this.emitSort(mediaItems);
	}

	onInit() {
		this.setField('image', null);
	}

	mediaSelected() {
		this.$refs.form.submit();
	}

	showSelectMedia() {
		this.$refs.upload.showFileSelect();
	}

	onDragOver(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (!e.dataTransfer.items.length || e.dataTransfer.items[0].kind !== 'file') {
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
		if (!e.dataTransfer.items.length || e.dataTransfer.items[0].kind !== 'file') {
			return;
		}

		e.preventDefault();
		this.isDropActive = false;
		this.$refs.upload.drop(e);
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
		this.emitUpload(MediaItem.populate(response.mediaItems));
	}
}
