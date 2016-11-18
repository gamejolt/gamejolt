import { Component, Inject, Input } from 'ng-metadata/core';
import { Channels } from './../channels-service';
import template from 'html!./thumbnail.html';

@Component({
	selector: 'gj-channel-thumbnail',
	template,
})
export class ThumbnailComponent
{
	@Input( '@' ) channel: string;
	@Input( '<?' ) gamesCount?: number;

	constructor(
		@Inject( 'Channels' ) public channelsInfo: Channels,
	)
	{
	}
}
