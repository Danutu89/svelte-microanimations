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
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t, u) => `
            opacity: ${target_opacity * t};
            transform: ${transform} translate3d(${params.x ? params.x * u : 0}px, ${params.y ? params.y * u : 0}px, 0);
        `
	};
}

// Scale up with fade
export function popScale(node: Element, params: ScaleParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	// Set default values for params
	const start = params.start ?? 0.95;
	const opacity = params.opacity ?? 0;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: ${transform} scale(${start + (1 - start) * t});
            opacity: ${opacity + (target_opacity - opacity) * t};
        `
	};
}

// Rotate and fade in
export function spinIn(node: Element, params: RotateParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	// Default values for rotation and translation
	const degrees = params.degrees ?? 180;
	const y = params.y ?? 20;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: ${transform} rotate(${degrees * (1 - t)}deg) translateY(${y * (1 - t)}px);
            opacity: ${target_opacity * t};
        `
	};
}

// Stagger reveal (good for text)
export function revealSlide(node: Element, params: GenericTransitionParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            ${transform}
            clip-path: inset(0 ${100 - t * 100}% 0 0);
            opacity: ${target_opacity * t};
        `
	};
}

// Bounce scale effect
export function bounceScale(node: Element, params: GenericTransitionParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: ${transform} scale(${1 + 0.1 * (1 - t)});
            opacity: ${target_opacity * t};
        `
	};
}

// 3D flip effect
export function flip3D(node: Element, params: GenericTransitionParams = {}): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t, u) => `
            transform: ${transform} perspective(1000px) rotateX(${90 * u}deg);
            opacity: ${target_opacity * t};
            transform-origin: 50% 100%;
        `
	};
}
export function scaleAndRotate(
	node: Element,
	params: ScaleParams & RotateParams = {}
): TransitionConfig {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;

	// Set default values
	const start = params.start ?? 0.95;
	const degrees = params.degrees ?? 180;
	const y = params.y ?? 20;
	const opacity = params.opacity ?? 0;

	return {
		delay: params.delay,
		duration: params.duration,
		easing: params.easing,
		css: (t) => `
            transform: ${transform} scale(${start + (1 - start) * t}) rotate(${degrees * (1 - t)}deg) translateY(${y * (1 - t)}px);
            opacity: ${opacity + (target_opacity - opacity) * t};
        `
	};
}
