<template>
	<div class="row">
		<div class="col-md-8">
			<template v-if="!isWizard && !isCollaborator">
				<h2 class="section-header">
					<translate>Development Stage</translate>
				</h2>

				<app-game-dev-stage-selector :game="game" />

				<hr />
			</template>

			<form-game :model="game" @submit="onSaved" />
		</div>
	</div>
</template>

<script lang="ts" src="./details" />
