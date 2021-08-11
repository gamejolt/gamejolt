import { Options, Vue } from 'vue-property-decorator';
import AppPageHeader from '../../../components/page-header/page-header.vue';

@Options({
	components: {
		AppPageHeader,
	},
})
export default class RouteDashAccountMobileNav extends Vue {}
