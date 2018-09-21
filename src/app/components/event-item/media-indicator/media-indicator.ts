import View from '!view!./media-indicator.html?style=./media-indicator.styl';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppEventItemMediaIndicator extends Vue {
	@Prop(Number)
	count!: number;

	@Prop(Number)
	current!: number;
}
