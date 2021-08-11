import { Options, Vue } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/expand.vue';

@Options({
	components: {
		AppExpand,
	},
})
export default class AppForumRules extends Vue {
	isShowingRules = false;
}
