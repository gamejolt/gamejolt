import { provide } from 'ng-metadata/core';
import { ModalCtrl } from './view-modal-controller';
import { DevlogPostViewModal } from './view-modal-service';

export default angular.module( 'App.Devlog.Post.ViewModal', [] )
.service( ...provide( 'DevlogPostViewModal', { useClass: DevlogPostViewModal } ) )
.controller( ...provide( 'Devlog.Post.ViewModalCtrl', { useClass: ModalCtrl } ) )
.name;
