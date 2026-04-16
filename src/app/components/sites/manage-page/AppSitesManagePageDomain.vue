<script lang="ts" setup>
import FormSiteDomain from '~app/components/forms/site/domain/FormSiteDomain.vue';
import { GameModel } from '~common/game/game.model';
import { SiteModel } from '~common/site/site-model';
import { useCommonStore } from '~common/store/common-store';

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
