import { Options, Vue } from 'vue-property-decorator';
import { Screen } from '../screen/screen-service';
import { AppTooltip } from '../tooltip/tooltip-directive';
import { Minbar, MinbarItem } from './minbar.service';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppMinbar extends Vue {
	readonly Minbar = Minbar;
	readonly Screen = Screen;

	onItemClick(item: MinbarItem) {
		if (item.onClick) {
			item.onClick();
		}
	}
}
