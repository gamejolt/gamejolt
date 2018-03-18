import { Settings } from '../settings/settings.service';
import { makeObservableService } from '../../lib/gj-lib-client/utils/vue';

export class Theme {
	static isDark = false;

	static sync() {
		if (Settings.get('theme-dark')) {
			document.body.classList.add('theme-dark');
			this.isDark = true;
		} else {
			document.body.classList.remove('theme-dark');
			this.isDark = false;
		}
	}

	static setDark(state: boolean) {
		Settings.set('theme-dark', state);
		this.sync();
	}
}

makeObservableService(Theme);
