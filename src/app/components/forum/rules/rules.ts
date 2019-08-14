import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppExpand from '../../../../_common/expand/expand.vue';

@Component({
	components: {
		AppExpand,
	},
})
export default class AppForumRules extends Vue {
	isShowingRules = false;
}
