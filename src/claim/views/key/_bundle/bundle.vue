<script lang="ts">
import { defineAsyncComponent } from 'vue';
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { GameBundle } from '../../../../_common/game-bundle/game-bundle.model';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { useCommonStore } from '../../../../_common/store/common-store';

@Options({
	components: {
		AppGameThumbnail: defineAsyncComponent(
			() => import('../../../../_common/game/thumbnail/AppGameThumbnail.vue')
		),
	},
})
export default class AppKeyBundle extends Vue {
	@Prop({ type: Object, required: true })
	payload!: any;

	@Prop({ type: String, required: true })
	loginUrl!: string;

	@Prop(String)
	accessKey?: string;

	commonStore = setup(() => useCommonStore());

	get app() {
		return this.commonStore;
	}

	bundle: GameBundle = null as any;
	games: Game[] = [];

	@Emit('claim')
	emitClaim(_bundle: GameBundle) {}

	created() {
		this.bundle = new GameBundle(this.payload.bundle);
		this.games = Game.populate(this.payload.games);
	}

	claim() {
		this.emitClaim(this.bundle);
	}
}
</script>

<template>
	<div>
		<div v-if="!app.user" class="alert full-bleed full-bleed-xs text-center">
			<p>
				<a :href="loginUrl">
					<AppTranslate>
						Sign in to Game Jolt to be able to claim this bundle into your Library.
					</AppTranslate>
				</a>
			</p>
		</div>

		<p v-if="app.user">
			<AppButton primary block @click="claim()">
				<AppTranslate>Claim Bundle into Library</AppTranslate>
			</AppButton>
		</p>

		<h1 class="section-header">{{ bundle.title }}</h1>
		<p>{{ bundle.description }}</p>

		<h3>
			<AppTranslate>Games in Bundle</AppTranslate>
		</h3>

		<div class="row">
			<div v-for="game of games" :key="game.id" class="col-sm-6">
				<AppGameThumbnail
					:game="game"
					:link-to="
						$router.resolve({
							name: 'key',
							params: { accessKey: accessKey },
							query: { bundleGameId: game.id },
						}).href
					"
					hide-pricing
				/>
			</div>
		</div>
	</div>
</template>
