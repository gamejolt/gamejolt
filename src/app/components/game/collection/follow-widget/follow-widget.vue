<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { vAppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { formatNumber } from '../../../../../_common/filters/number';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import {
	libraryFollowCollection,
	libraryUnfollowCollection,
	useLibraryStore,
} from '../../../../store/library';
import { GameCollection } from '../collection.model';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppGameCollectionFollowWidget extends Vue {
	@Prop(Object)
	collection!: GameCollection;

	@Prop(Number)
	followerCount?: number;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	circle?: boolean;

	@Prop(Boolean)
	block?: boolean;

	commonStore = setup(() => useCommonStore());
	libraryStore = shallowSetup(() => useLibraryStore());

	get user() {
		return this.commonStore.user;
	}

	get collections() {
		return this.libraryStore.collections.value;
	}

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
			? this.$gettext(
					'Unfollow this playlist to remove it from your library and stop receiving notifications.'
			  )
			: this.$gettext(
					'Follow this playlist to add it to your library and be notified when new games are added.'
			  );
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
				await libraryUnfollowCollection(this.libraryStore, this.collection);
			} catch (e) {
				this.emitUnfollow();
				throw e;
			}
		} else {
			try {
				this.emitFollow();
				await libraryFollowCollection(this.libraryStore, this.collection);
			} catch (e) {
				this.emitFollow();
				throw e;
			}
		}
	}
}
</script>

<template>
	<AppButton
		v-app-auth-required
		v-app-tooltip.bottom="tooltip"
		v-app-track-event="`game-collection-follow:${!isFollowing ? 'follow' : 'unfollow'}`"
		class="game-collection-follow-widget"
		primary
		:icon="icon"
		:circle="circle"
		:overlay="overlay"
		:block="block"
		:solid="isFollowing"
		:badge="badge"
		@click="onClick"
	>
		<template v-if="!circle">
			<template v-if="!isFollowing">
				<AppTranslate v-if="collection.type === 'developer'">Follow Developer</AppTranslate>
				<AppTranslate v-else-if="collection.type === 'jam'">Follow Jam</AppTranslate>
				<AppTranslate v-else>Follow Playlist</AppTranslate>
			</template>
			<template v-else>
				<AppTranslate>Following</AppTranslate>
			</template>
		</template>
	</AppButton>
</template>
