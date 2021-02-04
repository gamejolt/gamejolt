import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent, propOptional, propRequired } from '../../../../utils/vue';
import AppExpand from '../../../expand/expand.vue';
import { Screen } from '../../../screen/screen-service';
import AppCard from '../../card.vue';
import AppCardListTS from '../list';
import AppCardList from '../list.vue';

@Component({
	components: {
		AppExpand,
		AppCard,
	},
})
export default class AppCardListItem extends Vue {
	@Prop(propRequired()) item!: any;
	@Prop(propOptional(Boolean, false)) forceActive!: boolean;

	/** Takes up the padding that would show as if this card was expandable. */
	@Prop(propOptional(Boolean, false)) forceExpandablePadding!: boolean;

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
