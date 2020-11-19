import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { fuzzynumber } from '../../filters/fuzzynumber';

@Component({})
export default class AppStickerReactionsItem extends Vue {
	@Prop(propRequired(Number)) count!: number;
	@Prop(propRequired(String)) imgUrl!: string;

	get displayCount() {
		return fuzzynumber(this.count);
	}
}
