import { Component, Inject, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from 'ng-metadata/core';
import template from 'html!./video-embed.html';

@Component({
	selector: 'gj-devlog-post-media-video-embed',
	template,
})
export class VideoComponent implements OnChanges, AfterViewInit
{
	@Input( '<' ) mediaItem: any;
	@Input( '<' ) shouldPlay: boolean;

	@ViewChild( 'video' ) private $video: ng.IAugmentedJQuery;
	private video: HTMLVideoElement;

	isLoaded = false;

	webm: string;
	mp4: string;

	constructor(
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
				this.tryPlay();
			}
		}
	}

	ngAfterViewInit()
	{
		if ( !this.video ) {
			// https://developer.mozilla.org/en-US/docs/Web/Events/canplaythrough
			this.video = this.$video[0] as HTMLVideoElement;
			this.$video.on( 'canplaythrough', () =>
			{
				this.isLoaded = true;
				this.tryPlay();
			} );
		}
	}

	tryPlay()
	{
		if ( this.shouldPlay && this.isLoaded ) {
			this.play();
		}
	}

	private play()
	{
		if ( this.video ) {
			this.video.play();
		}
	}

	private stop()
	{
		if ( this.video ) {
			this.video.currentTime = 0;
			this.video.pause();
		}
	}
}
