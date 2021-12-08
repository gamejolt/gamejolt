import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { formatNumber } from '../../../../../_common/filters/number';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { LibraryModule, LibraryStore } from '../../../../store/library';
import { GameCollection } from '../collection.model';

@Options({
	directives: {
		AppTooltip,
		AppAuthRequired,
	},
})
export default class AppGameCollectionFollowWidget extends Vue {
	@Prop(GameCollection)
	collection!: GameCollection;

	@Prop(Number)
	followerCount?: number;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@Prop(Boolean)
	block?: boolean;

	@AppState
	user!: AppStore['user'];

	@LibraryModule.State
	collections!: LibraryStore['collections'];

	@LibraryModule.Action
	followCollection!: LibraryStore['followCollection'];

	@LibraryModule.Action
	unfollowCollection!: LibraryStore['unfollowCollection'];

	@Emit('follow')
	emitFollow() {}

	@Emit('unfollow')
	emitUnfollow() {}

	get isFollowing() {
		if (this.collection.type === GameCollection.TYPE_DEVELOPER) {
			return this.collection.owner!.is_following;
		}

		return (
			this.collections.findIndex(
				item =>
					item.type === this.collection.type && (item as any).id === this.collection.id
			) !== -1
		);
	}

	get badge() {
		return !this.circle && this.isFollowing && this.followerCount
			? formatNumber(this.followerCount)
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
		if (!this.user) {
			return;
		}

		// The rest of the revert is done in the store actions for the failure
		// case.
		if (this.isFollowing) {
			try {
				this.emitUnfollow();
				await this.unfollowCollection(this.collection);
			} catch (e) {
				this.emitUnfollow();
				throw e;
			}
		} else {
			try {
				this.emitFollow();
				await this.followCollection(this.collection);
			} catch (e) {
				this.emitFollow();
				throw e;
			}
		}
	}
}
