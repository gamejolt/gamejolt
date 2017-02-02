import { NgModule } from 'ng-metadata/core';

@NgModule({
	imports: [
		'App.Forum.ChannelList',
		'App.Forum.TopicList',
		'App.Forum.PostList',
		'App.Forum.Breadcrumbs',
		'App.Forum.Rules',
	],
})
export class ForumModule { }

require( './breadcrumbs/breadcrumbs-module' );
require( './channel-list/channel-list-module' );
require( './post-list/post-list-module' );
require( './rules/rules-module' );
require( './topic-list/topic-list-module' );
