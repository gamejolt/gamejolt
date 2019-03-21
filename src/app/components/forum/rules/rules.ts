import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue'

@Component({
	components: {
		AppExpand,
	},
})
export default class AppForumRules extends Vue {
	isShowingRules = false;
}
