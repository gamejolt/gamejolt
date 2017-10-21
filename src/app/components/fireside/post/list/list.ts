import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./list.html?style=./list.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';

@View
@Component({
	components: {
		AppTimeAgo,
	},
})
export class AppFiresidePostList extends Vue {
	@Prop(Array) posts: FiresidePost[];
	noThumb: string = require('../thumbnail/no-thumb.png');
}
