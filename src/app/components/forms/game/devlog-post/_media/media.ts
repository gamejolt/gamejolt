import View from '!view!./media.html?style=./media.styl';
import { AppImgResponsive } from 'game-jolt-frontend-lib/components/img/responsive/responsive';
import { AppLoadingFade } from 'game-jolt-frontend-lib/components/loading/fade/fade';
import { MediaItem } from 'game-jolt-frontend-lib/components/media-item/media-item-model';
import { AppScrollScroller } from 'game-jolt-frontend-lib/components/scroll/scroller/scroller';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppFormControlUpload } from '../../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppForm } from '../../../../../../lib/gj-lib-client/components/form-vue/form';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppFormGameDevlogPostMediaItem } from './item/item';

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
		AppLoadingFade,
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

	@Emit('upload')
	emitUpload(_newMediaItems: MediaItem[]) {}

	@Emit('sort')
	emitSort(_mediaItems: MediaItem[]) {}

	@Emit('remove')
	emitRemove(_mediaItem: MediaItem) {}

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
		this.emitUpload(MediaItem.populate(response.mediaItems));
	}
}
