import { provide } from 'ng-metadata/core';
import { ShellBodyComponent } from './body/body.component';
import { ShellSidebarComponent } from './sidebar/sidebar.component';
import { Shell } from './shell-service';
import { ShellComponent } from './shell.component';
import { ShellChatPaneComponent } from './chat-pane/chat-pane.component';
import { ShellFooterComponent } from './footer/footer.component';
import { ShellHotBottomComponent } from './hot-bottom/hot-bottom.component';
import { ShellTopNavComponent } from './top-nav/top-nav.component';
import { ShellUserBoxComponent } from './user-box/user-box.component';
import { ShellAccountPopoverComponent } from './account-popover/account-popover.component';

export default angular.module( 'App.Shell', [] )
.service( ...provide( 'Shell', { useClass: Shell } ) )
.directive( ...provide( ShellComponent ) )
.directive( ...provide( ShellChatPaneComponent ) )
.directive( ...provide( ShellSidebarComponent ) )
.directive( ...provide( ShellBodyComponent ) )
.directive( ...provide( ShellFooterComponent ) )
.directive( ...provide( ShellHotBottomComponent ) )
.directive( ...provide( ShellTopNavComponent ) )
.directive( ...provide( ShellAccountPopoverComponent ) )
.directive( ...provide( ShellUserBoxComponent ) )
.name;
