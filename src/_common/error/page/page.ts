import { Options, Vue } from 'vue-property-decorator';
import { AppMutation, AppState, AppStore } from '../../store/app-store';
import { ErrorPages } from './page-components';

import errorImage from './ararat.png';

@Options({})
export default class AppErrorPage extends Vue {
	@AppState error!: AppStore['error'];
	@AppMutation clearError!: AppStore['clearError'];

	watcher?: Function;

	readonly errorImage = errorImage;

	get page() {
		if (this.error) {
			return ErrorPages[this.error];
		}
	}

	mounted() {
		// We want to do it AFTER the route resolves for the next route we are going to.
		this.watcher = this.$router.afterEach(() => {
			if (this.error) {
				this.clearError();
			}
		});
	}

	unmounted() {
		if (this.watcher) {
			this.watcher();
			this.watcher = undefined;
		}
	}
}
