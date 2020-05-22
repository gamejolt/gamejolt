import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppCommunityDiscoverWidget from '../../../../../_common/community/discover-widget/discover-widget.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Component({
	components: {
		AppCommunityDiscoverWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppCommunitySliderDiscoverItem extends Vue {}
