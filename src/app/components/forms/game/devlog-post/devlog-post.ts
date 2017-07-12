import { Component } from 'vue-property-decorator';
import * as View from '!view!./devlog-post.html';

import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { GameVideo } from '../../../../../lib/gj-lib-client/components/game/video/video.model';
import { KeyGroup } from '../../../../../lib/gj-lib-client/components/key-group/key-group.model';
import { AppFormLoader } from '../../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppFormControlMarkdown } from '../../../../../lib/gj-lib-client/components/form-vue/control/markdown/markdown';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import { AppForm } from '../../../../../lib/gj-lib-client/components/form-vue/form';
import { AppFocusWhen } from '../../../../../lib/gj-lib-client/components/form-vue/focus-when.directive';

type FormGameDevlogPostModel = FiresidePost & {
	keyGroups: KeyGroup[];
	video_url: string;
	sketchfab_id: string;
};

@View
@Component({
	components: {
		AppFormLoader,
		AppFormControlMarkdown,
		AppFormControlUpload,
	},
	directives: {
		AppFocusWhen,
	},
})
export class FormGameDevlogPost extends BaseForm<FormGameDevlogPostModel>
	implements FormOnInit {
	modelClass = FiresidePost as any;

	$refs: {
		form: AppForm;
	};

	keyGroups: KeyGroup[] = [];
	hasMediaItems = false;
	wasPublished = false;
	maxFilesize = 0;
	maxWidth = 0;
	maxHeight = 0;

	FiresidePost = FiresidePost;
	GameVideo = GameVideo;

	onInit() {
		const model = this.model!;
		this.setField('status', FiresidePost.STATUS_ACTIVE);

		if (model.type === FiresidePost.TYPE_VIDEO) {
			if (model.videos.length) {
				this.setField(
					'video_url',
					'https://www.youtube.com/watch?v=' + model.videos[0].video_id
				);
			}
		} else if (model.type === FiresidePost.TYPE_SKETCHFAB) {
			if (model.sketchfabs.length) {
				this.setField('sketchfab_id', model.sketchfabs[0].sketchfab_id);
			}
		}
	}

	onLoaded(payload: any) {
		this.keyGroups = KeyGroup.populate(payload.keyGroups);
		this.hasMediaItems = payload.hasMediaItems;
		this.wasPublished = payload.wasPublished;
		this.maxFilesize = payload.maxFilesize;
		this.maxWidth = payload.maxWidth;
		this.maxHeight = payload.maxHeight;
	}

	onDraftSubmit() {
		this.setField('status', FiresidePost.STATUS_DRAFT);
		this.$refs.form.submit();
	}
}
