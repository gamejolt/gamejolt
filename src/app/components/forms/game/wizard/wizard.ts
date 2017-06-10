import { provide } from 'ng-metadata/core';
import { WizardControlsComponent } from './wizard-controls-directive';
import { FormDashboardGameWizard } from './wizard-service';

export default angular.module( 'App.Forms.Dashboard.Game.Wizard', [] )
.directive( ...provide( WizardControlsComponent ) )
.service( ...provide( 'FormDashboardGameWizard', { useClass: FormDashboardGameWizard } ) )
.name
;
