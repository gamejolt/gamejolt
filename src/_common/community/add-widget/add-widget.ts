import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppTooltip } from '../../tooltip/tooltip';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppCommunityAddWidget extends Vue {}
