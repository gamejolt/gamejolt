import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
import * as View from '!view!./sidebar.html?style=./sidebar.styl';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { GameCollection } from '../../game/collection/collection.model';
import { AppRouterLink } from '../../router-link/router-link';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppUserAvatarImg } from '../../../../lib/gj-lib-client/components/user/user-avatar/img/img';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';
import { AppState } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { Mutations } from '../../../store/index';

@View
@Component({
	components: {
		AppRouterLink,
		AppPopover,
		AppJolticon,
		AppUserAvatarImg,
	},
	directives: {
		AppPopoverTrigger,
		AppTooltip,
		AppTrackEvent,
	},
	filters: {
		number,
	}
})
export class AppShellSidebar extends Vue
{
	@State app: AppState;
	@State isBootstrapped: boolean;
	@State collections: GameCollection[];
	@State bundleCollections: GameCollection[];
	@State developerCollection?: GameCollection;
	@State followedCollection: GameCollection;
	@State recommendedCollection: GameCollection;
	@State ownedCollection: GameCollection;
	@State notificationCount: number;

	@Getter isLeftPaneVisible: boolean;

	@Mutation( Mutations.toggleLeftPane )
	toggleLeftPane: Function;

	playlistFilterQuery = '';

	channels = [
		'horror',
		'multiplayer',
		'retro',
		'survival',
		'fangame',
		'fnaf',
	];

	genres = {
		'action': 'Action',
		'adventure': 'Adventure',
		'arcade': 'Arcade',
		'platformer': 'Platformer',
		'puzzle': 'Puzzle',
		'rpg': 'RPG',
		'shooter': 'Shooter',
		'sports': 'Sports',
		'strategy-sim': 'Strategy/Sim',
		'other': 'Other',
	};

	env = Environment;
	screen = makeObservableService( Screen );

	// Show hot when logged in, otherwise default to best.
	get defaultBrowseSection()
	{
		return this.app.user ? 'hot' : 'best';
	}

	get filteredPlaylists()
	{
		return this.collections.sort( ( a, b ) => stringSort( a.name, b.name ) );
	}

	get filteredBundleCollections()
	{
		return this.bundleCollections.sort( ( a, b ) => stringSort( a.name, b.name ) );
	}

	showAddPlaylistModal()
	{
		// TODO
		// getProvider<any>( 'GamePlaylist_SaveModal' ).show()
		// 	.then( ( response: any ) =>
		// 	{
		// 		const collection = new GameCollection( response.gameCollection );
		// 		Shell.addPlaylist( collection );
		// 		getProvider<StateService>( '$state' ).go( collection.getSref(), collection.getSrefParams() );
		// 	} );
	}

	/**
	 * We compare the collection's name or owner's name if it's a subscription.
	 * This way they can search for "cros" and get cros's games if they're following.
	 */
	playlistFilterComparator( item: any )
	{
		let actual: string;
		let expected = this.playlistFilterQuery.toLowerCase();

		actual = item.name.toLowerCase();
		if ( actual.indexOf( expected ) !== -1 ) {
			return true;
		}

		if ( item.from_subscription ) {
			actual = item.owner.username.toLowerCase();
			if ( actual.indexOf( expected ) !== -1 ) {
				return true;
			}
		}

		return false;
	}
}
