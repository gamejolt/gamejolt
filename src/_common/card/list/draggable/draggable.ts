import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { findRequiredVueParent, propOptional } from '../../../../utils/vue';
import AppCardListTS from '../list';
import AppCardList from '../list.vue';

const draggable = require('vuedraggable');

@Component({
	components: {
		draggable,
	},
})
export default class AppCardListDraggable extends Vue {
	@Prop(propOptional(Boolean, false)) disabled!: boolean;

	list: AppCardListTS = null as any;

	get items() {
		return this.list.items;
	}

	set items(items: any[]) {
		this.emitChange(items);
	}

	@Emit('change')
	emitChange(_items: any[]) {}

	created() {
		this.list = findRequiredVueParent(this, AppCardList) as AppCardListTS;
		this.list.isDraggable = !this.disabled;
	}

	@Watch('disabled')
	onDisabledChanged() {
		this.list.isDraggable = !this.disabled;
	}
}
