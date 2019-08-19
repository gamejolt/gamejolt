import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppCardList extends Vue {
	@Prop(Array) items!: any[];
	@Prop({ default: null })
	activeItem: any | null;
	@Prop(Boolean) isAdding?: boolean;

	isDraggable = false;

	activate(item: any | null) {
		this.$emit('activate', item);
	}
}
