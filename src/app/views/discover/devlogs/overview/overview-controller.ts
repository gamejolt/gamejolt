import { Injectable, Inject } from 'ng-metadata/core';
import { App } from '../../../../app-service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { FiresidePost } from '../../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { ActivityFeedContainer } from '../../../../components/activity/feed/feed-container-service';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { Game } from '../../../../../lib/gj-lib-client/components/game/game.model';

@Injectable()
export class OverviewCtrl
{
	games: any[];
	posts: ActivityFeedContainer;

	isLearnMoreExpanded = false;

	constructor(
		@Inject( 'App' ) app: App,
		@Inject( 'Meta' ) meta: Meta,
		@Inject( 'payload' ) payload: any
	)
	{
		app.title = 'Indie game devlogs';
		meta.description = 'Find the latest and greatest games in development and follow their devlog feeds!';

		meta.fb.title = app.title;
		meta.twitter.title = app.title;

		meta.fb.description = meta.description;
		meta.twitter.description = meta.description;

		meta.twitter.image = require( '../social.png' );

		this.games = Game.populate( payload.games );
		this.posts = ActivityFeedService.bootstrap( FiresidePost.populate( payload.posts ) );
	}
}
