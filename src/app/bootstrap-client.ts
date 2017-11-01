import { ClientAutoStart } from './components/client/autostart/autostart.service';
import { ClientControl } from './components/client/control/client.service';
import { ClientHistoryNavigator } from './components/client/history-navigator/history-navigator.service';
import { ClientShortcut } from './components/client/shortcut/shortcut.service';
import Vue from 'vue';

ClientAutoStart.init();
ClientControl.init();
ClientHistoryNavigator.init();
ClientShortcut.create();

Vue.use(vue => {
	(vue.prototype as any).GJ_IS_CLIENT = GJ_IS_CLIENT;
});
