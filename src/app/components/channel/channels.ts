import { provide } from 'ng-metadata/core';
import { Channels } from './channels-service';

export default angular.module( 'App.Channels', [] )
.service( ...provide( Channels ) )
.name;
