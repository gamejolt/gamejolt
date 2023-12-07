<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/AppCard.vue';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { SiteModel } from '../../../../_common/site/site-model';

@Options({
	components: {
		AppCard,
	},
})
export default class AppSitesLinkCard extends Vue {
	@Prop(Object) site!: SiteModel;

	copyLink() {
		Clipboard.copy(this.site.url);
	}
}
</script>

<template>
	<AppCard>
		<div class="card-content">
			<p>
				<AppTranslate>This is your Site URL:</AppTranslate>
			</p>
			<input class="form-control" :value="site.url" />
		</div>
		<div class="card-controls">
			<AppButton block icon="link" @click="copyLink">
				<AppTranslate>Copy Link</AppTranslate>
			</AppButton>
			<AppButton block icon="arrow-forward" :href="site.url" target="_blank">
				<AppTranslate>View Site</AppTranslate>
			</AppButton>
		</div>
	</AppCard>
</template>
