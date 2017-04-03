import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./text.html';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppFadeCollapse } from '../../../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';
import { AppWidgetCompiler } from '../../../../../../lib/gj-lib-client/components/widget-compiler/widget-compiler';

@View
@Component({
	components: {
		AppFadeCollapse,
		AppWidgetCompiler,
	},
})
export class AppActivityFeedDevlogPostText extends Vue
{
	@Prop( FiresidePost ) post: FiresidePost;

	canToggleContent = false;
	showFullContent = false;

	toggleFull()
	{
		this.showFullContent = !this.showFullContent;
		this.$emit( 'expanded' );
	}
}
