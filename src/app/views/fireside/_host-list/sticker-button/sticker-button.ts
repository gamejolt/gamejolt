import Vue from 'vue';
import Component from 'vue-class-component';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHostListStickerButton extends Vue {}
