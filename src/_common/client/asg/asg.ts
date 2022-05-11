import type { EventEmitter as TypeofEventEmitter } from 'events';
import { markRaw, reactive } from 'vue';
const { EventEmitter } = require('events') as typeof import('events');

const asgNative = require('asg-prebuilt');

const sampleRate = 44100;
const numChannels = 2;
const format: AudioSampleFormat = 'f32';

export type ASGInstanceStatus = 'starting' | 'started' | 'stopping' | 'stopped';

export type ASGInstance = {
	readonly pid: number;
	_writer: WritableStreamDefaultWriter<AudioData>;
	_uid: string;
	_emitter: TypeofEventEmitter;
	_status: ASGInstanceStatus;
};

export function startCapture(pid: number, writer: WritableStream<AudioData>): ASGInstance {
	const emitter = new EventEmitter();

	const asgInst = reactive({
		pid,
		_writer: markRaw(writer.getWriter()),
		_emitter: markRaw(emitter),
		_uid: '',
		_status: 'starting',
	} as ASGInstance);

	let nextTimestamp = 0;
	emitter
		.on('status_update', (text: string) => {
			console.log('Status update: ' + text);
			if (text == 'Recording ends') {
				// TODO close the stream and dispose of resources
			}
		})
		.on('error', (text: string) => {
			console.log('Caught error: ' + text);
			// TODO abort the stream and dispose of resources
		})
		.on('data', (data: Float32Array) => {
			if (asgInst._status !== 'started') {
				return;
			}

			const currTimeLength = (data.length * 1000000) / sampleRate;
			nextTimestamp += currTimeLength;
			const audioData = new AudioData({
				format: format,
				numberOfChannels: numChannels,
				numberOfFrames: data.length,
				timestamp: nextTimestamp,
				sampleRate: sampleRate,
				data: data,
			});

			asgInst._writer.write(audioData);
		});

	// TODO make startCapture a promise.
	try {
		const uid = asgNative.startCapture(pid, emitter.emit.bind(emitter));
		asgInst._uid = uid;
		asgInst._status = 'started';
	} catch (error) {
		console.error('Got error while starting ASG capture', error);
		cleanup(asgInst);
	}

	return asgInst;
}

export async function stopCapture(asg: ASGInstance): Promise<void> {
	// TODO if the state is still starting we need to either abort the
	// startCapture or wait until its done before continuing.

	if (asg._status === 'stopping' || asg._status === 'stopped') {
		return;
	}

	asg._status = 'stopping';
	// TODO make this a promise, and await on it.
	asgNative.endCapture(asg._uid);
	asg._status = 'stopped';

	cleanup(asg);
}

function cleanup(asg: ASGInstance) {
	asg._emitter.removeAllListeners();

	// TODO make sure this behaves if you call it multiple times.
	// We want to be able to call cleanup on the instance whenever.
	// Also, this is a promise, should we be returning this or handling rejections here?
	asg._writer.close();
}
