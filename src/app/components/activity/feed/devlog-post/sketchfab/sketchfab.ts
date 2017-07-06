import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./sketchfab.html?style=./sketchfab.styl';

import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { FiresidePostSketchfab } from '../../../../../../lib/gj-lib-client/components/fireside/post/sketchfab/sketchfab-model';
import { AppJolticon } from '../../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppSketchfabEmbed } from '../../../../../../lib/gj-lib-client/components/sketchfab/embed/embed';
import { AppResponsiveDimensions } from '../../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';

@View
@Component({
	components: {
		AppJolticon,
		AppSketchfabEmbed,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedDevlogPostSketchfab extends Vue {
	@Prop([FiresidePost])
	post: FiresidePost;

	sketchfab: FiresidePostSketchfab | null = null;
	isShowing = false;

	created() {
		this.sketchfab = this.post.sketchfabs[0];
	}

	play() {
		this.isShowing = true;
		this.$emit('expanded');
	}
}
