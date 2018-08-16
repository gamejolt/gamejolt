import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./follow-widget.html';

import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import { AppTrackEvent } from '../../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppAuthRequired } from '../../../../../lib/gj-lib-client/components/auth/auth-required-directive.vue';
import { AppTooltip } from '../../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { GameCollection } from '../collection.model';
import { LibraryState, LibraryStore, LibraryAction } from '../../../../store/library';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';

@View
@Component({
	directives: {
		AppTrackEvent,
		AppTooltip,
		AppAuthRequired,
	},
})
export class AppGameCollectionFollowWidget extends Vue {
	@Prop(GameCollection) collection!: GameCollection;
	@Prop(Number) followerCount?: number;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) circle?: boolean;
	@Prop(Boolean) block?: boolean;

	@AppState user!: AppStore['user'];
	@LibraryState collections!: LibraryStore['collections'];
	@LibraryAction followCollection!: LibraryStore['followCollection'];
	@LibraryAction unfollowCollection!: LibraryStore['unfollowCollection'];

	isProcessing = false;

	get isFollowing() {
		return (
			this.collections.findIndex(
				item =>
					item.type === this.collection.type && (item as any).id === this.collection.id
			) !== -1
		);
	}

	get badge() {
		return !this.circle && this.isFollowing && this.followerCount
			? number(this.followerCount)
			: '';
	}

	get tooltip() {
		if (
			this.collection.type === GameCollection.TYPE_DEVELOPER ||
			this.collection.type === GameCollection.TYPE_JAM
		) {
			return undefined;
		}

		return this.isFollowing
			? this.$gettext('library.collection.unfollow_button_tooltip')
			: this.$gettext('library.collection.follow_button_tooltip');
	}

	get icon() {
		if (!this.circle) {
			return '';
		}

		return !this.isFollowing ? 'subscribe' : 'subscribed';
	}

	async onClick() {
		if (!this.user || this.isProcessing) {
			return;
		}

		this.isProcessing = true;

		if (this.isFollowing) {
			await this.unfollowCollection(this.collection);
			this.$emit('unfollow');
		} else {
			await this.followCollection(this.collection);
			this.$emit('follow');
		}

		this.isProcessing = false;
	}
}
