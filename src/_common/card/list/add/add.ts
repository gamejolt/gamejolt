import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { findRequiredVueParent, propOptional, propRequired } from '../../../../utils/vue';
import AppExpand from '../../../expand/expand.vue';
import { Screen } from '../../../screen/screen-service';
import AppCardListTS from '../list';
import AppCardList from '../list.vue';

@Component({
	components: {
		AppExpand,
	},
})
export default class AppCardListAdd extends Vue {
	@Prop(propRequired(String)) label!: string;
	@Prop(propOptional(String)) icon?: string;

	list: AppCardListTS = null as any;

	readonly Screen = Screen;

	get isActive() {
		return this.list.isAdding;
	}

	created() {
		this.list = findRequiredVueParent(this, AppCardList) as AppCardListTS;
	}

	toggle() {
		this.$emit('toggle');
	}
}
