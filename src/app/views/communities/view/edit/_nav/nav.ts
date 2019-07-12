import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({})
export default class AppCommunitiesViewEditNav extends Vue {
	@Prop(Community)
	community!: Community;

	get routeName() {
		return this.$route.name ? this.$route.name : '';
	}
}
