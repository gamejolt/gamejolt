import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../utils/vue';
import './backdrop-global.styl';
import { Backdrop } from './backdrop.service';

@Options({})
export default class AppBackdrop extends Vue {
	@Prop(propOptional(String)) className?: string;

	@Emit('clicked')
	emitClicked() {}

	remove() {
		Backdrop.remove(this);
	}
}
