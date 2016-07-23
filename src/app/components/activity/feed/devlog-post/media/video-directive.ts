import { Component, Inject, Input, OnChanges, SimpleChanges } from 'ng-metadata/core';
import template from 'html!./video.html';

@Component({
	selector: 'gj-activity-feed-devlog-post-media-video',
	template,
})
export class VideoComponent implements OnChanges
{
	@Input( '<' ) mediaItem: any;
	@Input( '<' ) shouldPlay: boolean;

	webm: string;
	mp4: string;

	constructor(
		@Inject( '$element' ) private $element: ng.IAugmentedJQuery,
		@Inject( '$sce' ) $sce: ng.ISCEService,
	)
	{
		this.webm = $sce.trustAsResourceUrl( this.mediaItem.mediaserver_url_webm );
		this.mp4 = $sce.trustAsResourceUrl( this.mediaItem.mediaserver_url_mp4 );
	}

	ngOnChanges( changes: SimpleChanges )
	{
		if ( changes['shouldPlay'] ) {
			if ( !this.shouldPlay ) {
				this.stop();
			}
			else {
				this.play();
			}
		}
	}

	play()
	{
		const videoElem = this.$element[0].querySelector( 'video' ) as HTMLVideoElement;
		videoElem.play();
	}

	stop()
	{
		const videoElem = this.$element[0].querySelector( 'video' ) as HTMLVideoElement;
		videoElem.currentTime = 0;
		videoElem.pause();
	}
}
