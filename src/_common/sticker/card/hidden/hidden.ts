import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';

@Component({})
export default class AppStickerCardHidden extends Vue {
	@Prop(propOptional(Number, 0)) count!: number;
	@Prop(propOptional(Boolean, false)) disabled!: boolean;
}
