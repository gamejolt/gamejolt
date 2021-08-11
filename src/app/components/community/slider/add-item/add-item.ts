import { Options, Vue } from 'vue-property-decorator';
import AppCommunityAddWidget from '../../../../../_common/community/add-widget/add-widget.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	components: {
		AppCommunityAddWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitySliderAddItem extends Vue {}
