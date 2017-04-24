import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./overview.html?style=./overview.styl';

import { GameCollection } from '../../../components/game/collection/collection.model';
import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppPageHeader } from '../../../components/page-header/page-header';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppGameCollectionList } from '../../../components/game/collection/list/list';
import { AppGameCollectionGrid } from '../../../components/game/collection/grid/grid';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppPageHeader,
		AppJolticon,
		AppGameCollectionGrid,
		AppGameCollectionList,
	},
})
export default class RouteLibraryOverview extends Vue
{
	@State library: Store['library'];
	@State isBootstrapped: Store['isBootstrapped'];

	Connection = makeObservableService( Connection );
	Screen = makeObservableService( Screen );

	created()
	{
		Meta.title = this.$gettext( 'library.page_title' );
	}

	get collectionGroups()
	{
		return [
			{
				key: 'mainCollections',
				heading: null,
				eventLabel: 'system',
				collections: this.mainCollections,
			},
			{
				key: 'playlistCollections',
				heading: this.$gettext( 'Your Playlists' ),
				eventLabel: 'playlist',
				collections: this.playlistCollections,
			},
			// {
			// 	key: 'bundleCollections',
			// 	heading: this.$gettext( 'Bundles' ),
			// 	eventLabel: 'bundle',
			// 	collections: ,
			// },
			{
				key: 'followedCollections',
				heading: this.$gettext( 'Followed Playlists' ),
				eventLabel: 'followed',
				collections: this.followedCollections,
			}
		];
	}

	get mainCollections()
	{
		const main: GameCollection[] = [];

		if ( this.library.followedCollection ) {
			main.push( this.library.followedCollection );
		}

		if ( this.library.developerCollection ) {
			main.push( this.library.developerCollection );
		}

		if ( this.library.ownedCollection ) {
			main.push( this.library.ownedCollection );
		}

		if ( this.library.recommendedCollection ) {
			main.push( this.library.recommendedCollection );
		}

		return main;
	}

	get playlistCollections()
	{
		return this.library.collections.filter( ( collection ) =>
		{
			if ( collection.type === 'playlist' && !collection.from_subscription ) {
				return true;
			}
			return false;
		} );
	}

	get followedCollections()
	{
		return this.library.collections.filter( ( collection ) =>
		{
			if ( collection.from_subscription ) {
				return true;
			}
			return false;
		} );
	}
}
