import View from '!view!./media.html?style=./media.styl';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { AppScrollScroller } from 'game-jolt-frontend-lib/components/scroll/scroller/scroller';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { AppFormGameDevlogPostMediaItem } from './item/item';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppForm } from '../../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppFormControlUpload } from '../../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';

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
		AppFormGameDevlogPostMediaItem,
		AppFormControlUpload,
	},
})
export class AppFormGameDevlogPostMedia extends BaseForm<FormModel>
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

	resetOnSubmit = true;

	$refs!: {
		form: AppForm;
		upload: AppFormControlUpload;
	};

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

	async onSubmit() {
		return Api.sendRequest(
			`/web/dash/developer/games/devlog/add-media/${this.post.game.id}/${this.post.id}`,
			{},
			{
				file: this.formModel.image,
				progress: e => this.setField('_progress', e),
			}
		);
	}

	onSubmitSuccess(response: any) {
		this.emitUploaded(MediaItem.populate(response.mediaItems));
	}

	@Emit('uploaded')
	emitUploaded(_mediaItems: MediaItem[]) {}

	@Emit('sort')
	emitSort(_mediaItems: MediaItem[]) {}

	@Emit('remove')
	emitRemove(_mediaItem: MediaItem) {}
}
