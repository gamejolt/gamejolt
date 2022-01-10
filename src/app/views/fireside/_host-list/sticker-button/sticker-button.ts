import { Options, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideHostListStickerButton extends Vue {}
