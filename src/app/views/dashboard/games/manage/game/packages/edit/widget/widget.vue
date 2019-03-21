<template>
	<div class="row">
		<div class="col-sm-10 col-md-5 col-lg-6">
			<div class="page-help">
				<p>
					<strong>
						<translate>
							You can use our Package Widget to embed games directly on your own site!
						</translate>
					</strong>
				</p>

				<p>
					<translate>
						For purchases made by Game Jolt members, your game will automatically appear in their
						Game Library.
					</translate>
				</p>
				<p>
					<translate>
						Purchases made by folks who aren't members or signed into Game Jolt will be emailed a
						link to a game key page; all future updates you make to your games will be retrievable
						through this same page.
					</translate>
				</p>
			</div>

			<h3>
				<translate>Configure</translate>
			</h3>

			<div class="form-horizontal">
				<div class="form-group">
					<label class="control-label col-xs-3"><translate>Theme</translate></label>
					<div class="col-xs-9">
						<div class="radio">
							<label>
								<input type="radio" v-model="theme" value="" />
								<translate>Dark</translate>
							</label>
						</div>
						<div class="radio">
							<label>
								<input type="radio" v-model="theme" value="light" />
								<translate>Light</translate>
							</label>
						</div>
					</div>
				</div>
			</div>

			<h3>
				<translate>Embed Code</translate>
			</h3>

			<textarea class="form-control" rows="3">{{ widgetCode }}</textarea>
		</div>
		<div class="col-sm-10 col-md-7 col-lg-6">
			<h3 :class="{ 'section-header': Screen.isDesktop }">
				<translate>Widget Preview</translate>
			</h3>

			<div class="full-bleed-xs">
				<iframe :src="widgetUrl" frameborder="0" style="width: 100%" height="245"></iframe>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./widget" />
