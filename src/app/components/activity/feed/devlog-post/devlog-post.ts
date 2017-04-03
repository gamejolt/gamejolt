import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./devlog-post.html?style=./devlog-post.styl';

import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Screen } from '../../../../../lib/gj-lib-client/components/screen/screen-service';
import { ActivityFeedItem } from '../item-service';
// import { DevlogPostViewModal } from '../../../devlog/post/view-modal/view-modal-service';
import { makeObservableService, findVueParent } from '../../../../../lib/gj-lib-client/utils/vue';
import { AppActivityFeed } from '../feed';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameThumbnailImg } from '../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { AppTimeAgo } from '../../../../../lib/gj-lib-client/components/time/ago/ago';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppActivityFeedDevlogPostText } from './text/text';
import { AppActivityFeedDevlogPostMedia } from './media/media';
import { AppActivityFeedDevlogPostSketchfab } from './sketchfab/sketchfab';
import { AppActivityFeedDevlogPostVideo } from './video/video';
import { AppActivityFeedDevlogPostControls } from './controls/controls';

@View
@Component({
	components: {
		AppJolticon,
		AppGameThumbnailImg,
		AppTimeAgo,
		AppActivityFeedDevlogPostText,
		AppActivityFeedDevlogPostMedia,
		AppActivityFeedDevlogPostSketchfab,
		AppActivityFeedDevlogPostVideo,
		AppActivityFeedDevlogPostControls,
	},
	filters: {
		number,
	},
})
export class AppActivityFeedDevlogPost extends Vue
{
	@Prop( ActivityFeedItem ) item: ActivityFeedItem;

	post: FiresidePost;

	feed: AppActivityFeed;
	Screen = makeObservableService( Screen );

	get icon()
	{
		if ( this.post.type === 'text' ) {
			return 'blog-article';
		}
		else if ( this.post.type === 'media' ) {
			return 'screenshot';
		}
		else if ( this.post.type === 'video' ) {
			return 'video';
		}

		return '';
	}

	created()
	{
		this.feed = findVueParent( this, AppActivityFeed ) as AppActivityFeed;
		this.post = this.item.feedItem as FiresidePost;
	}

	// constructor(
	// 	@Inject( 'DevlogPostViewModal' ) private viewModal: DevlogPostViewModal,
	// 	@Inject( 'gjActivityFeed' ) @SkipSelf() @Optional() public feed: ActivityFeedComponent,
	// )
	// {
	// }

	onExpand()
	{
		this.$emit( 'expanded' );
	}

	onClick( event: Event )
	{
		if ( Screen.isXs ) {
			// this.viewModal.show( this.post );
			event.preventDefault();
		}
	}
}

