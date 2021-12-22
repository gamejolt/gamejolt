import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { FeaturedItem } from '../../../components/featured-item/featured-item.model';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import { AppAuthJoinLazy } from '../../../components/lazy';
import { Store } from '../../../store/index';
import AppDiscoverHomeBanner from './_banner/banner.vue';
import AppDiscoverHomeCommunities from './_communities/communities.vue';

@Component({
	name: 'HomeDefault',
	components: {
		AppDiscoverHomeBanner,
		AppDiscoverHomeCommunities,
		AppAuthJoin: AppAuthJoinLazy,
		AppLoading,
		AppFiresideBadge,
	},
})
export default class AppHomeDefault extends Vue {
	@State app!: Store['app'];

	@Prop(Boolean)
	isBootstrapped!: boolean;

	@Prop(FeaturedItem)
	featuredItem!: FeaturedItem | null;

	@Prop(Array)
	featuredCommunities!: Community[];

	@Prop(Fireside)
	featuredFireside!: Fireside | null;
}
