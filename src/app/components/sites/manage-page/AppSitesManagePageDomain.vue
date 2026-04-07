<script lang="ts" setup>
import { GameModel } from '../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { SiteModel } from '../../../../_common/site/site-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import FormSiteDomain from '../../forms/site/domain/FormSiteDomain.vue';

type Props = {
	site: SiteModel;
	game?: GameModel;
};

const { site, game } = defineProps<Props>();

const { user } = useCommonStore();

function onDomainSaved() {
	showSuccessGrowl(
		$gettext(`Your domain settings have been saved.`),
		$gettext(`Domain Saved`)
	);
}
</script>

<template>
	<div>
		<FormSiteDomain :model="site" :user="user" :game="game" @submit="onDomainSaved" />
	</div>
</template>
