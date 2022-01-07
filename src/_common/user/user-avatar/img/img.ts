import { Options, Prop, Vue } from 'vue-property-decorator';
import { User } from '../../user.model';
import guestImage from '../guest.png';

@Options({})
export default class AppUserAvatarImg extends Vue {
	@Prop(Object) user?: User;

	hasError = false;

	readonly guestImage = guestImage;
}
