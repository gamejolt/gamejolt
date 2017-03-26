import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./tags.html?style=./tags.styl';

import { GameFilteringContainer } from './container';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { Genre } from '../../genre/genre';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';

@View
@Component({
	name: 'game-filtering-tags',
	components: {
		AppJolticon,
	},
})
export class AppGameFilteringTags extends Vue
{
	@Prop( Object ) filtering: GameFilteringContainer;

	GameFilteringContainer = GameFilteringContainer;
	Genre = makeObservableService( Genre );

	get genre()
	{
		return this.$route.params.category;
	}

	removeFilterOption( filter: string, option: any )
	{
		Analytics.trackEvent( 'game-filtering', 'remove', filter + '-' + option );

		this.filtering.unsetFilter( filter, option );
		this.filtering.onChanged();
	}

	clearGenre()
	{
		this.$router.push( { name: 'discover.games.list._fetch' } );
	}
}
