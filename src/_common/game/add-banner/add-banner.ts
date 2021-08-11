import { Options, Vue } from 'vue-property-decorator';
import { AppAuthRequired } from '../../auth/auth-required-directive';

@Options({
	directives: {
		AppAuthRequired,
	},
})
export default class AppGameAddBanner extends Vue {}
