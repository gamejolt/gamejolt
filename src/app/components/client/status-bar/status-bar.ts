import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { ClientUpdater } from '../../../../_common/client/client-updater.service';
import { Client } from '../../../../_common/client/client.service';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import AppClientStatusBarPatchItem from './patch-item/patch-item.vue';

@Component({
	components: {
		AppJolticon,
		AppClientStatusBarPatchItem,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppClientStatusBar extends Vue {
	@ClientLibraryState
	gamesById!: ClientLibraryStore['gamesById'];

	@ClientLibraryState
	numPlaying!: ClientLibraryStore['numPlaying'];

	@ClientLibraryState
	numPatching!: ClientLibraryStore['numPatching'];

	@ClientLibraryState
	currentlyPlaying!: ClientLibraryStore['currentlyPlaying'];

	@ClientLibraryState
	currentlyPatching!: ClientLibraryStore['currentlyPatching'];

	updaterWarningDismissed = false;

	readonly number = number;

	get clientUpdateStatus() {
		return ClientUpdater.clientUpdateStatus;
	}

	get isShowing() {
		return this.numPatching > 0 || this.numPlaying > 0 || this.hasUpdate || this.showUpdaterIssue;
	}

	get currentlyPlayingList() {
		return this.currentlyPlaying.map(i => this.gamesById[i.game_id].title).join(', ');
	}

	get currentlyPatchingIds() {
		return Object.keys(this.currentlyPatching).map(i => parseInt(i, 10));
	}

	get hasUpdate() {
		return this.clientUpdateStatus === 'ready';
	}

	get showUpdaterIssue() {
		return this.clientUpdateStatus === 'error' && !this.updaterWarningDismissed;
	}

	dismissUpdaterWarning() {
		this.updaterWarningDismissed = true;
	}

	async updateClient() {
		await ClientUpdater.updateClient();
	}

	@Watch('isShowing', { immediate: true })
	onIsShowingChanged() {
		if (this.isShowing) {
			document.body.classList.add('has-hot-bottom');
		} else {
			document.body.classList.remove('has-hot-bottom');
		}
	}

	destroyed() {
		document.body.classList.remove('has-hot-bottom');
	}

	updateApply() {
		this.updateClient();
	}

	quitClient() {
		Client.quit();
	}
}
