import { Component, OnInit, Input } from 'ng-metadata/core';
import { Transition } from 'angular-ui-router';
import * as template from '!html-loader!./overview.component.html';

import { ChannelsViewHelper } from '../../channels-view-helper';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedContainer } from '../../../../../components/activity/feed/feed-container-service';
import { FiresidePost } from '../../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { Environment } from '../../../../../../lib/gj-lib-client/components/environment/environment.service';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';

@Component({
	selector: 'route-discover-channels-channel-overview',
	template,
})
export class RouteOverviewComponent implements OnInit
{
	@Input() payload: any;
	@Input() $transition$: Transition;

	@Input() shouldShowAds: boolean;
	@Input() channel: any;

	bestGames: any[];
	hotGames: any[];
	posts: ActivityFeedContainer;

	env = Environment;
	screen = Screen;

	ngOnInit()
	{
		this.bestGames = Game.populate( this.payload.bestGames ).slice( 0, 6 );
		this.hotGames = Game.populate( this.payload.hotGames ).slice( 0, 6 );
		this.posts = ActivityFeedService.bootstrap( FiresidePost.populate( this.payload.posts ) );

		ChannelsViewHelper.setDefaultMetaData( this.$transition$.params().channel );
	}
}
