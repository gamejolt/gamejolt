import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./thumbnail.html?style=./thumbnail.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Environment } from '../../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';

@View
@Component({
	components: {
		AppTimeAgo,
	},
})
export class AppFiresidePostThumbnail extends Vue {
	@Prop(FiresidePost) post: FiresidePost;

	noThumb: string = require('./no-thumb.png');
	Environment = Environment;
}
