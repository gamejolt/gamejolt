import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./status-bar.html?style=./status-bar.styl';

import { AppClientStatusBarPatchItem } from './patch-item/patch-item';
import { ClientLibraryState, ClientLibraryStore } from '../../../store/client-library';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { store as clientStore } from '../../../../_common/client/store';

@View
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
export class AppClientStatusBar extends Vue {
	@ClientLibraryState gamesById: ClientLibraryStore['gamesById'];
	@ClientLibraryState numPlaying: ClientLibraryStore['numPlaying'];
	@ClientLibraryState numPatching: ClientLibraryStore['numPatching'];
	@ClientLibraryState currentlyPlaying: ClientLibraryStore['currentlyPlaying'];
	@ClientLibraryState currentlyPatching: ClientLibraryStore['currentlyPatching'];

	get clientUpdateStatus() {
		return clientStore.state.clientUpdateStatus;
	}

	get isShowing() {
		return this.numPatching > 0 || this.numPlaying > 0 || this.hasUpdate;
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

	async updateClient() {
		await clientStore.dispatch('updateClient');
	}

	@Watch('isShowing', { immediate: true })
	onIsShowingChanged() {
		if (this.isShowing) {
			document.body.classList.add('status-bar-visible');
		} else {
			document.body.classList.remove('status-bar-visible');
		}
	}

	destroyed() {
		document.body.classList.remove('status-bar-visible');
	}

	updateApply() {
		this.updateClient();
	}
}
