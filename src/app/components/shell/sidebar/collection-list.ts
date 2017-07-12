import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./collection-list.html';

import { GameCollection } from '../../game/collection/collection.model';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { stringSort } from '../../../../lib/gj-lib-client/utils/array';

@View
@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppShellSidebarCollectionList extends Vue {
	@Prop(Array) collections: GameCollection[];
	@Prop(String) filter: string;
	@Prop(Boolean) shouldSort?: boolean;

	get filtered() {
		if (!this.shouldSort) {
			return this.collections;
		}

		return this.collections.sort((a, b) => {
			const aVal = a.type === 'developer' ? a.owner.username : a.name;
			const bVal = b.type === 'developer' ? b.owner.username : b.name;
			return stringSort(aVal, bVal);
		});
	}

	/**
	 * We compare the collection's name or owner's name if it's a subscription.
	 * This way they can search for "cros" and get cros's games if they're following.
	 */
	filterComparator(item: any) {
		let actual: string;
		let expected = this.filter.toLowerCase();

		actual = item.name.toLowerCase();
		if (actual.indexOf(expected) !== -1) {
			return true;
		}

		if (item.from_subscription) {
			actual = item.owner.username.toLowerCase();
			if (actual.indexOf(expected) !== -1) {
				return true;
			}
		}

		return false;
	}
}
