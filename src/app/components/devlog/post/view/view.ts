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
import { AppScrollWhen } from '../../../../../lib/gj-lib-client/components/scroll/scroll-when.directive.vue';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppDevlogPostViewPlaceholder } from './placeholder/placeholder';
import { AppAd } from '../../../../../lib/gj-lib-client/components/ad/ad';
import { AppAdPlacement } from '../../../../../lib/gj-lib-client/components/ad/placement/placement';

@View
@Component({
	components: {
		AppDevlogPostViewPlaceholder,
		AppTimeAgo,
		AppWidgetCompiler,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppSketchfabEmbed,
		AppActivityFeedControls,
		AppPollVoting,
		AppAd,
		AppAdPlacement,
	},
	directives: {
		AppScrollWhen,
	},
})
export class AppDevlogPostView extends Vue {
	@Prop(FiresidePost)
	post!: FiresidePost;

	@Prop(Boolean)
	inModal?: boolean;

	readonly Screen = Screen;
}
