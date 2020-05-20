import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppCommunityAddWidget from '../../../../../_common/community/add-widget/add-widget.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Component({
	components: {
		AppCommunityAddWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppShellCbarAddItem extends Vue {}
