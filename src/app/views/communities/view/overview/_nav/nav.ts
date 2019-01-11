import View from '!view!./nav.html?style=./nav.styl';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@View
@Component({})
export class AppCommunitiesViewOverviewNav extends Vue {
	@Prop(Community)
	community!: Community;

	@Prop(Array)
	tags!: string[];

	@Prop(String)
	channel!: string;
}
