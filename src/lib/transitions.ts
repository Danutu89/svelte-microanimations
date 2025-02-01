import type {
	BlurParams,
	CrossfadeParams,
	FadeParams,
	FlyParams,
	TransitionConfig
} from 'svelte/transition';

export type GenericTransitionParams = {
	delay?: number;
	duration?: number;
	easing?: (t: number) => number;
};

export type DirectionalParams = GenericTransitionParams & {
	y?: number;
	x?: number;
};

export type ScaleParams = GenericTransitionParams & {
	start?: number;
	opacity?: number;
};

export type RotateParams = GenericTransitionParams & {
	degrees?: number;
	y?: number;
};

// Define a type map for transitions and their params
export type TransitionParamsMap = {
	fadeSlide: DirectionalParams;
	popScale: ScaleParams;
	spinIn: RotateParams;
	revealSlide: GenericTransitionParams;
	bounceScale: GenericTransitionParams;
	flip3D: GenericTransitionParams;
	fade: FadeParams;
	slide: DirectionalParams;
	blur: BlurParams;
	fly: FlyParams;
	crossfade: CrossfadeParams;
	scale: ScaleParams;
};

// Elegant fade-slide combination
export function fadeSlide(node: Element, params: DirectionalParams = {}): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t, u) => `
            opacity: ${t};
            transform: translate3d(${params.x ? params.x * u : 0}px, ${params.y ? params.y * u : 0}px, 0);
        `
	};
}

// Scale up with fade
export function popScale(node: Element, params: ScaleParams = {}): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: scale(${params.start + (1 - params.start) * t});
            opacity: ${params.opacity + t * (1 - params.opacity)};
        `
	};
}

// Rotate and fade in
export function spinIn(node: Element, params: RotateParams = {}): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: rotate(${params.degrees * (1 - t)}deg) translateY(${params.y * (1 - t)}px);
            opacity: ${t};
        `
	};
}

// Stagger reveal (good for text)
export function revealSlide(node: Element, params: GenericTransitionParams = {}): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            clip-path: inset(0 ${100 - t * 100}% 0 0);
            opacity: ${t};
        `
	};
}

// Bounce scale effect
export function bounceScale(node: Element, params: GenericTransitionParams = {}): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: scale(${1 + 0.1 * (1 - t)});
            opacity: ${t};
        `
	};
}

// 3D flip effect
export function flip3D(node: Element, params: GenericTransitionParams = {}): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t, u) => `
            transform: perspective(1000px) rotateX(${90 * u}deg);
            opacity: ${t};
            transform-origin: 50% 100%;
        `
	};
}

export function scaleAndRotate(
	node: Element,
	params: ScaleParams & RotateParams = {}
): TransitionConfig {
	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: scale(${params.start + (1 - params.start) * t}) rotate(${params.degrees * (1 - t)}deg) translateY(${params.y * (1 - t)}px);
            opacity: ${params.opacity + t * (1 - params.opacity)};
        `
	};
}
