import { provide } from 'ng-metadata/core';
import List from './list/list';
import Channel from './channel/channel';
import { ChannelsViewHelper } from './channels-view-helper';

angular.module( 'App.Views.Channels', [
	List,
	Channel,
] )
.service( ...provide( 'ChannelsViewHelper', { useClass: ChannelsViewHelper } ) )
.name;
