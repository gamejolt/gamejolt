import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { SuggestionData } from '../../../components/search/payload-service';
import AppSearchSuggestionItem from './item/item.vue';

@Component({
	components: {
		AppSearchSuggestionItem,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppSearchSuggestion extends Vue {
	@Prop(propRequired()) data!: SuggestionData[];
}
