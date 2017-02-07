import { Component, Inject, Input } from 'ng-metadata/core';
import { Channels } from '../channels-service';
import * as template from '!html-loader!./thumbnail.html';

@Component({
	selector: 'gj-channel-thumbnail',
	template,
})
export class ThumbnailComponent
{
	@Input( '@' ) channel: string;
	@Input( '<' ) gamesCount?: number;

	constructor(
		@Inject( 'Channels' ) public channelsInfo: Channels,
	)
	{
	}
}
