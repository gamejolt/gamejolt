import { provide } from 'ng-metadata/core';
import { SiteEditorModalComponent } from './site-editor-modal.component';
import { SiteEditorModal } from './site-editor-modal.service';

export default angular.module( 'App.SiteEditorModal', [
] )
.directive( ...provide( SiteEditorModalComponent ) )
.service( ...provide( 'SiteEditorModal', { useClass: SiteEditorModal } ) )
.name;
