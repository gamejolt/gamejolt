import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../utils/vue';
import AppJolticon from '../../../../vue/components/jolticon/jolticon.vue';
import AppExpand from '../../../expand/expand.vue';
import { Screen } from '../../../screen/screen-service';
import AppCard from '../../card.vue';
import AppCardListTS from '../list';
import AppCardList from '../list.vue';

@Component({
	components: {
		AppExpand,
		AppCard,
		AppJolticon,
	},
})
export default class AppCardListItem extends Vue {
	@Prop() item!: any;
	@Prop(Boolean) forceActive?: boolean;

	list: AppCardListTS = null as any;

	readonly Screen = Screen;

	get isActive() {
		return this.forceActive || this.list.activeItem === this.item;
	}

	get isExpandable() {
		return !!this.$slots.body;
	}

	get isDraggable() {
		return this.list.isDraggable;
	}

	created() {
		this.list = findRequiredVueParent(this, AppCardList) as AppCardListTS;
	}

	onClick() {
		if (this.isExpandable) {
			this.list.activate(this.isActive ? null : this.item);
		}
	}
}
