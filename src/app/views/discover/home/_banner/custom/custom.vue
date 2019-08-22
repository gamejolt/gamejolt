<template>
	<section
		class="-banner section landing-header"
		:style="{
			'background-image': `url('${backUrl}')`,
		}"
	>
		<div class="container">
			<div class="-main">
				<div class="-logo">
					<img class="img-responsive" style="display: inline-block" :src="frontUrl" alt="" />
				</div>

				<div class="-info">
					<p class="lead">
						{{ featureContent }}
					</p>

					<div class="-controls">
						<div>
							<app-button
								solid
								:href="location"
								target="_blank"
								v-app-track-event="`home:banner:custom:${trackEventName}-button`"
							>
								{{ buttonText }}
							</app-button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" src="./custom.styl" scoped></style>

<script lang="ts" src="./custom"></script>
