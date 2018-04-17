import { Settings } from '../settings/settings.service';
import { makeObservableService } from '../../lib/gj-lib-client/utils/vue';
import { ThemeModel } from './theme.model';

export class Theme {
	static isDark = false;
	static theme = new ThemeModel();

	static sync() {
		if (GJ_IS_SSR) {
			return;
		}

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
