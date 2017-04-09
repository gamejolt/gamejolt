import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';
import * as View from '!view!./sidebar.html?style=./sidebar.styl';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
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
import { Mutations, GetterLibrary } from '../../../store/index';
import { LibraryState } from '../../../store/library';
import { AppShellSidebarCollectionList } from './collection-list';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';

@View
@Component({
	components: {
		AppRouterLink,
		AppPopover,
		AppJolticon,
		AppUserAvatarImg,
		AppShellSidebarCollectionList,
		AppExpand,
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
	@State library: LibraryState;
	@State isBootstrapped: boolean;
	@State notificationCount: number;

	@Getter isLeftPaneVisible: boolean;
	@GetterLibrary playlistFolders: any;

	@Mutation( Mutations.toggleLeftPane )
	toggleLeftPane: Function;

	playlistFilterQuery = '';
	openFolders: string[] = [];

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

	Environment = Environment;
	Screen = makeObservableService( Screen );

	// Show hot when logged in, otherwise default to best.
	get defaultBrowseSection()
	{
		return this.app.user ? 'hot' : 'best';
	}

	get filteredBundleCollections()
	{
		return this.library.bundleCollections.sort( ( a, b ) => stringSort( a.name, b.name ) );
	}

	toggleFolder( key: string )
	{
		console.log( 'toggle', key );
		const index = this.openFolders.indexOf( key );
		if ( index === -1 ) {
			this.openFolders.push( key );
		}
		else {
			this.openFolders.splice( index, 1 );
		}
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
}
