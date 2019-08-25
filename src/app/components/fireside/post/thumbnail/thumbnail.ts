import { Environment } from '../../../../../_common/environment/environment.service';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppTimeAgo,
	},
})
export default class AppFiresidePostThumbnail extends Vue {
	@Prop(FiresidePost) post!: FiresidePost;

	noThumb: string = require('./no-thumb.png');
	Environment = Environment;
}
