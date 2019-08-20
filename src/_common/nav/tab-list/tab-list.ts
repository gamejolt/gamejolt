import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';

@Component({})
export default class AppNavTabList extends Vue {
	@Prop(Boolean) center?: boolean;

	readonly Screen = Screen;
}
