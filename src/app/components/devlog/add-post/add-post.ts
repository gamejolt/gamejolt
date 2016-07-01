import { provide } from 'ng-metadata/core';
import { AddPostComponent } from './add-post-directive';
import { ModalCtrl } from './modal-controller';
import { DevlogAddPostModal } from './modal-service';

export default angular.module( 'App.Devlog.AddPost', [] )
.directive( ...provide( AddPostComponent ) )
.service( ...provide( 'DevlogAddPostModal', { useClass: DevlogAddPostModal } ) )
.controller( ...provide( 'Devlog.AddPost.ModalCtrl', { useClass: ModalCtrl } ) )
.name;
