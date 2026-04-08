<script lang="ts" setup>
import { GameModel } from '../../../../_common/game/game.model';
import { SiteModel } from '../../../../_common/site/site-model';
import { useCommonStore } from '../../../../_common/store/common-store';
import FormSiteDomain from '../../forms/site/domain/FormSiteDomain.vue';

type Props = {
	site: SiteModel;
	game?: GameModel;
};

const { site, game } = defineProps<Props>();

const { user } = useCommonStore();
</script>

<template>
	<div>
		<FormSiteDomain v-if="user" :model="site" :user="user" :game="game" />
	</div>
</template>
