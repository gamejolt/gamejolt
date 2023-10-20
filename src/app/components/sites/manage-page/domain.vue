<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { GameModel } from '../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { SiteModel } from '../../../../_common/site/site-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import FormSiteDomain from '../../forms/site/domain/domain.vue';

@Options({
	components: {
		FormSiteDomain,
	},
})
export default class AppSitesManagePageDomain extends Vue {
	@Prop(Object) site!: SiteModel;
	@Prop(Object) game?: GameModel;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	onDomainSaved() {
		showSuccessGrowl(
			this.$gettext(`Your domain settings have been saved.`),
			this.$gettext(`Domain Saved`)
		);
	}
}
</script>

<template>
	<div>
		<FormSiteDomain :model="site" :user="app.user" :game="game" @submit="onDomainSaved" />
	</div>
</template>
