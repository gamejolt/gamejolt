import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./view.html?style=./view.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { AppWidgetCompiler } from '../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';
import { AppResponsiveDimensions } from '../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';
import { AppImgResponsive } from '../../../../../lib/gj-lib-client/components/img/responsive/responsive';
import { AppVideo } from '../../../../../lib/gj-lib-client/components/video/video';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppSketchfabEmbed } from '../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { AppActivityFeedControls } from '../../../activity/feed/controls/controls';
import { AppPollVoting } from '../../../poll/voting/voting';

@View
@Component({
	components: {
		AppTimeAgo,
		AppWidgetCompiler,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppActivityFeedControls,
		AppPollVoting,
	},
})
export class AppDevlogPostView extends Vue {
	@Prop(FiresidePost) post!: FiresidePost;
	@Prop(Boolean) showGameInfo?: boolean;
	@Prop(Boolean) inModal?: boolean;
}
