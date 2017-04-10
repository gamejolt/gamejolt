import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./channel-list.html?style=./channel-list.styl';

import { ForumCategory } from '../../../../lib/gj-lib-client/components/forum/category/category.model';
import { ForumChannel } from '../../../../lib/gj-lib-client/components/forum/channel/channel.model';
import { ForumPost } from '../../../../lib/gj-lib-client/components/forum/post/post.model';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { arrayIndexByFunc } from '../../../../lib/gj-lib-client/utils/array';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserAvatar } from '../../../../lib/gj-lib-client/components/user/user-avatar/user-avatar';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { AppTimeAgo } from '../../../../lib/gj-lib-client/components/time/ago/ago';

@View
@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
	},
	filters: {
		number,
	},
})
export class AppForumChannelList extends Vue
{
	@Prop( ForumCategory ) category: ForumCategory;
	@Prop( Array ) channels: ForumChannel[];
	@Prop( Array ) latestPosts: ForumPost[];
	@Prop( Number ) postCountPerPage: number;

	number = number;
	date = date;
	Screen = makeObservableService( Screen );

	get indexedPosts()
	{
		return arrayIndexByFunc( this.latestPosts, ( item ) => item.topic!.channel_id );
	}

	getPostPage( post: ForumPost )
	{
		if ( !this.postCountPerPage ) {
			return undefined;
		}

		const page = Math.ceil( post.topic!.replies_count / this.postCountPerPage );
		if ( page === 1 ) {
			return undefined;
		}

		return page;
	}
}
