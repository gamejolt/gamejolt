import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./video.html?style=./video.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../../lib/gj-lib-client/components/fireside/post/video/video-model';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppVideoEmbed } from '../../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';

@View
@Component({
	components: {
		AppJolticon,
		AppVideoEmbed,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedDevlogPostVideo extends Vue
{
	@Prop( FiresidePost ) post: FiresidePost;

	video: FiresidePostVideo | null = null;
	isShowingVideo = false;

	created()
	{
		this.video = this.post.videos[0];
	}

	play()
	{
		this.isShowingVideo = true;
		this.$emit( 'expanded' );
	}
}
