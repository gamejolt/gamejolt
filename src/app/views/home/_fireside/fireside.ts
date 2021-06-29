import Vue from 'vue';
import Component from 'vue-class-component';
import { Api } from '../../../../_common/api/api.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import AppFiresideBadgeAdd from '../../../components/fireside/badge/add/add.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import AppFiresideBadgePlaceholder from '../../../components/fireside/badge/placeholder/placeholder.vue';

@Component({
	components: {
		AppFiresideBadge,
		AppLoadingFade,
		AppFiresideBadgeAdd,
		AppFiresideBadgePlaceholder,
	},
})
export default class AppHomeFireside extends Vue {
	@AppState user!: AppStore['user'];

	userFireside: Fireside | null = null;
	firesides: Fireside[] = [];
	isLoading = true;
	isInitialLoading = true;

	mounted() {
		this.refresh();
	}

	onFiresideExpired() {
		// When a fireside expired while showing it here, refresh the list.
		// It will be excluded from the next fetch.
		this.refresh();
	}

	async refresh() {
		if (!this.user) {
			return;
		}

		this.isLoading = true;

		const payload = await Api.sendRequest(`/web/fireside/user-list`, undefined, {
			detach: true,
		});
		if (payload.userFireside) {
			this.userFireside = new Fireside(payload.userFireside);
		} else {
			this.userFireside = null;
		}
		if (payload.firesides) {
			this.firesides = Fireside.populate(payload.firesides);
		} else {
			this.firesides = [];
		}

		this.isLoading = false;
		this.isInitialLoading = false;
	}
}
