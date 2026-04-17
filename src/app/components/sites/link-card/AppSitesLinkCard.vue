<script lang="ts" setup>
import AppButton from '~common/button/AppButton.vue';
import AppCard from '~common/card/AppCard.vue';
import { Clipboard } from '~common/clipboard/clipboard-service';
import { SiteModel } from '~common/site/site-model';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	site: SiteModel;
};

const { site } = defineProps<Props>();

function copyLink() {
	Clipboard.copy(site.url);
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
