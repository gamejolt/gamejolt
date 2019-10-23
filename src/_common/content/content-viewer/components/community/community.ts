import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Community } from '../../../../community/community.model';
import AppCommunityPill from '../../../../community/pill/pill.vue';
import AppPill from '../../../../pill/pill.vue';
import { ContentOwner } from '../../../content-owner';

@Component({
	components: {
		AppPill,
		AppCommunityPill,
	},
})
export default class AppContentViewerCommunity extends Vue {
	@Prop(String)
	path!: string;

	@Prop(Object)
	owner!: ContentOwner;

	community: Community | null = null;

	created() {
		// Make sure we never execute a promise if we don't have to, it would break SSR.
		this.owner.getHydrator().useData<any>('community-path', this.path, data => {
			if (data !== null) {
				this.community = new Community(data);
			}
		});
	}
}
