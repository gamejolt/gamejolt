import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./comment-video-controls.html';

import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppActivityFeedCommentVideoControls extends Vue {}
