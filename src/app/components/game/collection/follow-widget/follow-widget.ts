import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./follow-widget.html';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppAuthRequired } from '../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { GameCollection } from '../collection.model';
import { LibraryState, LibraryStore, LibraryAction } from '../../../../store/library';

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
export class AppGameCollectionFollowWidget extends Vue {
	@Prop(GameCollection) collection: GameCollection;
	@Prop(Number) followerCount?: number;

	@LibraryState collections: LibraryStore['collections'];
	@LibraryAction followCollection: LibraryStore['followCollection'];
	@LibraryAction unfollowCollection: LibraryStore['unfollowCollection'];

	get isFollowing() {
		return (
			this.collections.findIndex(
				item => item.type === this.collection.type && (item as any).id === this.collection.id
			) !== -1
		);
	}

	async onClick() {
		if (this.isFollowing) {
			await this.unfollowCollection(this.collection);
			this.$emit('unfollow');
		} else {
			await this.followCollection(this.collection);
			this.$emit('follow');
		}
	}
}
