import { Options, Vue } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { EventSubscription } from '../../../../_common/system/event/event-topic';
import AppFiresideBadgeAdd from '../../../components/fireside/badge/add/add.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import AppFiresideBadgePlaceholder from '../../../components/fireside/badge/placeholder/placeholder.vue';
import { onFiresideStart } from '../../../components/grid/client.service';

@Options({
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

	firesideStart$?: EventSubscription;

	mounted() {
		this.refresh();
		this.firesideStart$ = onFiresideStart.subscribe(() => this.refresh());
	}

	unmounted() {
		this.firesideStart$?.close();
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

		try {
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
		} catch (error) {
			console.error('Failed to refresh Fireside data.', error);
		}

		this.isLoading = false;
		this.isInitialLoading = false;
	}
}
