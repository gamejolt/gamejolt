<template>
	<div class="row">
		<div class="col-lg-8">
			<h2 class="section-header">
				<translate>dash.games.api.settings.heading</translate>
			</h2>

			<div class="alert alert-notice">
				<p>
					<strong><translate>Never give your private key to anyone!</translate></strong>
					<translate>
						Your game's key is used to validate that API requests are coming from your game. If
						villains or knaves get ahold of it, they can send in fake requests pretending to be your
						game. Not good!
					</translate>
				</p>
			</div>

			<div class="table-responsive">
				<table class="table">
					<colgroup>
						<col class="col-xs-6 col-sm-5 col-md-4" />
					</colgroup>
					<tbody>
						<tr>
							<th>
								<translate>dash.games.api.settings.game_id_label</translate>
							</th>
							<td>{{ game.id }}</td>
						</tr>
						<tr>
							<th>
								<translate>dash.games.api.settings.key_label</translate>
							</th>
							<td>
								<template v-if="shouldShowKey">
									<input type="text" class="form-control" :value="privateKey" />
									<br />
								</template>
								<p v-else>
									<a class="link-muted" @click="shouldShowKey = true">
										<translate>dash.games.api.settings.key_show_link</translate>
									</a>
								</p>

								<app-button @click="generateNewKey">
									<translate>dash.games.api.settings.key_generate_button</translate>
								</app-button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./settings"></script>
