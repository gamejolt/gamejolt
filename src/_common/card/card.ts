import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

require('./card.styl');

@Component({})
export default class AppCard extends Vue {
	@Prop({ type: Boolean, default: false })
	isDraggable!: boolean;
	@Prop({ type: Boolean, default: false })
	isExpandable!: boolean;
	@Prop({ type: Boolean, default: false })
	isExpanded!: boolean;
	@Prop({ type: Boolean, default: false })
	isInactive!: boolean;
	@Prop({ type: Boolean, default: false })
	isDisabled!: boolean;
}
