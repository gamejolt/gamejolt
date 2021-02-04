import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';

@Component({})
export default class AppCardList extends Vue {
	@Prop(propRequired(Array)) items!: any[];
	@Prop(propOptional(undefined, null)) activeItem: any | null;
	@Prop(propOptional(Boolean, false)) isAdding!: boolean;

	isDraggable = false;

	@Emit('activate')
	emitActivate(_item: any) {}

	activate(item: any | null) {
		this.emitActivate(item);
	}
}
