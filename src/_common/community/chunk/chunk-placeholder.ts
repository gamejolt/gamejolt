import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppPostCardPlaceholder from '../../../app/components/fireside/post/card/card-placeholder.vue';
import { Screen } from '../../screen/screen-service';
import AppScrollScroller from '../../scroll/scroller/scroller.vue';

@Component({
	components: {
		AppScrollScroller,
		AppPostCardPlaceholder,
	},
})
export default class AppCommunityChunkPlaceholder extends Vue {
	readonly Screen = Screen;
	readonly preferredCardsPerRow = 5;
}
