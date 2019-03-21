import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { stringSort } from 'game-jolt-frontend-lib/utils/array';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameCollection } from '../../game/collection/collection.model';

@Component({
	components: {
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppShellSidebarCollectionList extends Vue {
	@Prop(Array) collections!: GameCollection[];
	@Prop(String) filter!: string;
	@Prop(Boolean) shouldSort?: boolean;

	get filtered() {
		if (!this.shouldSort) {
			return this.collections;
		}

		return this.collections.sort((a, b) => {
			const aVal = a.type === 'developer' && a.owner ? a.owner.username : a.name;
			const bVal = b.type === 'developer' && b.owner ? b.owner.username : b.name;
			return stringSort(aVal, bVal);
		});
	}

	/**
	 * We compare the collection's name or owner's name if it's a subscription.
	 * This way they can search for "cros" and get cros's games if they're following.
	 */
	filterComparator(item: GameCollection) {
		let actual: string;
		let expected = this.filter.toLowerCase();

		actual = item.name.toLowerCase();
		if (actual.indexOf(expected) !== -1) {
			return true;
		}

		if (item.from_subscription && item.owner) {
			actual = item.owner.username.toLowerCase();
			if (actual.indexOf(expected) !== -1) {
				return true;
			}
		}

		return false;
	}
}
