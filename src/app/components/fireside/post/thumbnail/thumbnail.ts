import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
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
