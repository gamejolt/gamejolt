import { provide } from 'ng-metadata/core';
import { MediaBarComponent } from './media-bar-directive';

export default angular.module( 'App.Game.MediaBar', [
	'gj.Game.Screenshot',
	'gj.Game.Video'
] )
.directive( ...provide( MediaBarComponent ) )
.name;

angular.module( 'App.Game.MediaBar' ).constant( 'GameMediaBarLightboxConfig', {
	opacityStart: 0.5,
	scaleStart: 0.5,
	controlsHeight: 80,
	itemPadding: 40,
} );
