import { provide } from 'ng-metadata/core';
import Channel from './channel/channel';
import { Channels_ViewHelper } from './channels-view-helper';

angular.module( 'App.Views.Channels', [
	Channel,
] )
.service( ...provide( 'Channels_ViewHelper', { useClass: Channels_ViewHelper } ) )
.name;
