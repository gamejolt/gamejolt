import { provide } from 'ng-metadata/core';
import { DevlogCtrl } from './devlog-controller';
import { FeedCtrl } from './feed/feed-controller';

export default angular
	.module('App.Views.Dashboard.Developer.Games.Manage.Devlog', [])
	.controller(
		...provide('Dashboard.Developer.Games.Manage.DevlogCtrl', {
			useClass: DevlogCtrl,
		}),
	)
	.controller(
		...provide('Dashboard.Developer.Games.Manage.Devlog.FeedCtrl', {
			useClass: FeedCtrl,
		}),
	).name;
