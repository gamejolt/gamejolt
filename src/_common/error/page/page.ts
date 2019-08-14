import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppMutation, AppState, AppStore } from '../../../vue/services/app/app-store';
import { ErrorPages } from './page-components';

@Component({})
export default class AppErrorPage extends Vue {
	@AppState error!: AppStore['error'];
	@AppMutation clearError!: AppStore['clearError'];

	watcher?: Function;

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

	destroyed() {
		if (this.watcher) {
			this.watcher();
			this.watcher = undefined;
		}
	}
}
