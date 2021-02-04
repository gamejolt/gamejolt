import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../utils/vue';

require('./card.styl');

@Component({})
export default class AppCard extends Vue {
	@Prop(propOptional(Boolean, false)) isDraggable!: boolean;
	@Prop(propOptional(Boolean, false)) isExpandable!: boolean;
	@Prop(propOptional(Boolean, false)) isExpanded!: boolean;
	@Prop(propOptional(Boolean, false)) isInactive!: boolean;
	@Prop(propOptional(Boolean, false)) isDisabled!: boolean;

	/** Takes up the padding that would show as if this card was expandable. */
	@Prop(propOptional(Boolean, false)) forceExpandablePadding!: boolean;
}
