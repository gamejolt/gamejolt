import { provide } from 'ng-metadata/core';
import { BroadcastModalCtrl } from './broadcast-modal.controller';
import { BroadcastModal } from './broadcast-modal.service';

export default angular.module( 'App.BroadcastModal', [] )
.controller( 'BroadcastModalCtrl', BroadcastModalCtrl )
.service( ...provide( 'BroadcastModal', { useClass: BroadcastModal } ) )
.name;
