<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import AppCard from '../../../../_common/card/card.vue';
import { Clipboard } from '../../../../_common/clipboard/clipboard-service';
import { Site } from '../../../../_common/site/site-model';

@Options({
	components: {
		AppCard,
	},
})
export default class AppSitesLinkCard extends Vue {
	@Prop(Object) site!: Site;

	copyLink() {
		Clipboard.copy(this.site.url);
	}
}
</script>

<template>
	<app-card>
		<div class="card-content">
			<p>
				<translate>This is your Site URL:</translate>
			</p>
			<input class="form-control" :value="site.url" />
		</div>
		<div class="card-controls">
			<app-button block icon="link" @click="copyLink">
				<translate>Copy Link</translate>
			</app-button>
			<app-button block icon="arrow-forward" :href="site.url" target="_blank">
				<translate>View Site</translate>
			</app-button>
		</div>
	</app-card>
</template>
