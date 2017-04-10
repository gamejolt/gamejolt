import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./follow-widget.html';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppAuthRequired } from '../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { LibraryState } from '../../../../store/library';
import { GameCollection } from '../collection.model';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppAuthRequired,
	},
	filters: {
		number,
	},
})
export class AppGameCollectionFollowWidget extends Vue
{
	@Prop( GameCollection ) collection: GameCollection;
	@Prop( Number ) followerCount?: number;

	@State library: LibraryState;

	get isFollowing()
	{
		return this.library.collections.findIndex(
			( item ) => item.type === this.collection.type && (item as any).id === this.collection.id,
		) !== -1;
	}

	onClick()
	{
		if ( this.isFollowing ) {
			this.library.unfollowCollection( this.collection );
		}
		else {
			this.library.followCollection( this.collection );
		}
	}
}
