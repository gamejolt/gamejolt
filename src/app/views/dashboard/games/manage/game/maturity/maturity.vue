<template>
	<div class="row">
		<div class="col-sm-5 col-sm-push-7">
			<app-scroll-affix v-if="current" :disabled="!Screen.isDesktop" :scroll-offset="15">
				<div class="anim-fade-enter anim-fade-leave" v-if="current.tigrs_age">
					<app-game-ogrs :game="current"></app-game-ogrs>
				</div>
			</app-scroll-affix>

			<div class="page-help">
				<p>
					<translate>
						Every game on Game Jolt, even works-in-progress, needs a maturity rating to describe its
						content. Accurate ratings and details about content help gamers make informed decisions.
						Remember, you can always come back later and make changes.
					</translate>
				</p>
				<p>
					<app-link-help page="dev-maturity-ratings" class="link-help">
						<translate>dash.games.maturity.page_help_link</translate>
					</app-link-help>
				</p>
			</div>
		</div>

		<div class="col-sm-7 col-sm-pull-5">
			<!--
			We set current whenever the form model changes so updates can be reflected in scroll affix and tigrs.
		-->
			<form-game-maturity
				:model="game"
				@changed="current = $event"
				@submit="onSaved"
			></form-game-maturity>
		</div>
	</div>
</template>

<script lang="ts" src="./maturity"></script>
