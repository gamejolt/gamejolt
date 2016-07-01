import { provide } from 'ng-metadata/core';
import { ModalCtrl } from './edit-controller';
import { DevlogPostEdit } from './edit-service';

export default angular.module( 'App.Devlog.Post.Edit', [] )
.service( ...provide( 'DevlogPostEdit', { useClass: DevlogPostEdit } ) )
.controller( ...provide( 'Devlog.Post.EditModalCtrl', { useClass: ModalCtrl } ) )
.name;
