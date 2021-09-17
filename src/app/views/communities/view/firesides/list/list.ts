import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { Fireside } from '../../../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppFiresideAvatar from '../../../../../components/fireside/avatar/avatar.vue';
import AppFiresideAvatarBase from '../../../../../components/fireside/avatar/_base/base.vue';

@Component({
	components: {
		AppFiresideAvatar,
		AppLoading,
		AppFiresideAvatarBase,
	},
})
export default class AppFiresidesList extends Vue {
	@Prop({ type: String, required: true })
	url!: string;

	@Prop({ type: Array, required: false, default: [] })
	initialFiresides!: Fireside[];

	firesides: Fireside[] = [];
	page = 1;
	isLoading = false;
	reachedEnd = false;

	@Watch('initialFiresides', { immediate: true })
	onInitialFiresidesChange(firesides: Fireside[]) {
		this.firesides = [];
		this.page = 1;
		this.reachedEnd = false;

		if (firesides) {
			this.firesides.push(...firesides);
		}
	}

	get placeholderCount() {
		// 2 rows for all breakpoints
		return this.gridColumns * 2;
	}

	get gridStyling() {
		return {
			display: 'grid',
			gridTemplateColumns: `repeat(${this.gridColumns}, 1fr)`,
			gridGap: '16px',
		};
	}

	get gridColumns() {
		if (Screen.isXs) {
			return 4;
		} else if (Screen.isSm) {
			return 5;
		}

		return 6;
	}

	get shouldShowLoadMore() {
		return !this.reachedEnd;
	}

	async loadPage() {
		let url = this.url;

		if (this.page) {
			url += `?offset=${this.page}`;
		}

		const payload = await Api.sendRequest(url);
		return Fireside.populate(payload.firesides);
	}

	async loadMore() {
		if (this.isLoading) {
			return;
		}

		this.page++;
		this.isLoading = true;

		const pageFiresides = await this.loadPage();
		if (!pageFiresides || !pageFiresides.length) {
			this.page--;
			this.reachedEnd = true;
		} else {
			this.firesides.push(...pageFiresides);
		}

		this.isLoading = false;
	}
}
