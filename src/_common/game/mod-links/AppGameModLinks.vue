<script lang="ts" setup>
import { Api } from '~common/api/api.service';
import { Environment } from '~common/environment/environment.service';
import { GameModel } from '~common/game/game.model';
import { showSuccessGrowl } from '~common/growls/growls.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';

type Props = {
	game: GameModel;
};
const { game } = defineProps<Props>();

async function tag(tag: string) {
	// It won't return what site api expects for output, so gotta catch.
	try {
		await Api.sendRequest(`/games/tags/tag/${game.id}/${tag}`, null, {
			apiPath: '/moderate',
			processPayload: false,
		});
	} catch (_e) {
		showSuccessGrowl('Tagged the game.');
	}
}

async function untag(tag: string) {
	// It won't return what site api expects for output, so gotta catch.
	try {
		await Api.sendRequest(`/games/tags/untag/${game.id}/${tag}`, null, {
			apiPath: '/moderate',
			processPayload: false,
		});
	} catch (_e) {
		showSuccessGrowl('Untagged the game.');
	}
}
</script>

<template>
	<div class="list-group list-group-dark">
		<a class="list-group-item has-icon" target="_blank" @click="tag('fnaf')">
			<AppJolticon icon="tag" />
			<span>Tag: #fnaf</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('fangame')">
			<AppJolticon icon="tag" />
			<span>Tag: #fangame</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('gjhot')">
			<AppJolticon icon="tag" />
			<span>Tag: #gjhot</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="untag('gjhot')">
			<AppJolticon icon="tag" />
			<span>Untag: #gjhot</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('gjboost')">
			<AppJolticon icon="tag" />
			<span>Tag: #gjboost</span>
		</a>
		<a class="list-group-item has-icon" target="_blank" @click="tag('gjhome')">
			<AppJolticon icon="tag" />
			<span>Tag: #gjhome</span>
		</a>
		<a
			class="list-group-item has-icon"
			:href="Environment.baseUrl + `/moderate/games/view/${game.id}`"
			target="_blank"
		>
			<AppJolticon icon="cog" />
			<span>Moderate Game</span>
		</a>
	</div>
</template>
