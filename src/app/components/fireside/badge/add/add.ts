import Vue from 'vue';
import Component from 'vue-class-component';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { AppTheme } from '../../../../../_common/theme/theme';

@Component({
	components: {
		AppTheme,
	},
})
export default class AppFiresideBadgeAdd extends Vue {
	@AppState user!: AppStore['user'];

	get theme() {
		return this.user?.theme;
	}

	$refs!: {
		header: HTMLDivElement;
	};
}
