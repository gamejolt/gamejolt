import { ClientAutoStart } from './components/client/autostart/autostart.service';
import { ClientControl } from './components/client/control/client.service';
import { ClientHistoryNavigator } from './components/client/history-navigator/history-navigator.service';
import { ClientShortcut } from './components/client/shortcut/shortcut.service';

ClientAutoStart.init();
ClientControl.init();
ClientHistoryNavigator.init();
ClientShortcut.create();
