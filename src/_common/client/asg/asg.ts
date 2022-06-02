import { computed, markRaw, ref } from 'vue';
const { EventEmitter } = require('events') as typeof import('events');

const asgNative = require('asg-prebuilt');
const process = require('process') as typeof import('process');

const SampleRate = 44100;
const NumChannels = 1;
const Format: AudioSampleFormat = 'f32';

export type ASGControllerStatus = 'starting' | 'started' | 'stopping' | 'stopped';

export type ASGController = ReturnType<typeof startDesktopAudioCapture>;

export function startDesktopAudioCapture(writableStream: WritableStream<AudioData>) {
	// We get the parent process's pid since it would also contain all the child
	// pids under it then.
	const appPid = process.ppid;

	const writer = markRaw(writableStream.getWriter());
	const emitter = markRaw(new EventEmitter());
	const uid = ref('');
	const status = ref<ASGControllerStatus>('starting');

	emitter
		.on('status_update', (text: string) => {
			console.log('Status update: ' + text);
			if (text === 'Recording ends') {
				// TODO close the stream and dispose of resources
			}
		})
		.on('error', (text: string) => {
			console.log('Caught error: ' + text);
			// TODO abort the stream and dispose of resources
		})
		.on('data', (data: Float32Array, timestamp: number) => {
			try {
				if (status.value !== 'started') {
					return;
				}

				const audioData = new AudioData({
					format: Format,
					numberOfChannels: NumChannels,
					numberOfFrames: data.length,
					timestamp,
					sampleRate: SampleRate,
					data,
				});

				writer.write(audioData);
			} catch (err) {
				console.error(err);
			}
		});

	try {
		uid.value = asgNative.startCapture(appPid, emitter.emit.bind(emitter));
		status.value = 'started';
	} catch (error) {
		console.error('Got error while starting ASG capture', error);
		_cleanup();
	}

	async function stop() {
		// TODO if the state is still starting we need to either abort the
		// startCapture or wait until its done before continuing.

		if (status.value === 'stopping' || status.value === 'stopped') {
			return;
		}

		status.value = 'stopping';
		// TODO make this a promise, and await on it.
		asgNative.endCapture(uid.value);
		status.value = 'stopped';

		_cleanup();
	}

	function _cleanup() {
		emitter.removeAllListeners();

		// TODO make sure this behaves if you call it multiple times.
		// We want to be able to call cleanup on the instance whenever.
		// Also, this is a promise, should we be returning this or handling rejections here?
		writer.close();
	}

	return {
		// readonly
		pid: computed(() => appPid),
		writer,
		emitter,
		uid,
		status,

		stop,
	};
}
