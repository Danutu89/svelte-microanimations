import type { blur, crossfade, fade, fly, TransitionConfig } from 'svelte/transition';
import { linear } from 'svelte/easing';
import { scale, slide } from 'svelte/transition';
import { tick } from 'svelte';
import type {
	bounceScale,
	fadeSlide,
	flip3D,
	popScale,
	revealSlide,
	spinIn
} from './transitions.ts';

type TransitionFunctionMap = {
	scale: typeof scale;
	slide: typeof slide;
	fadeSlide: typeof fadeSlide;
	popScale: typeof popScale;
	spinIn: typeof spinIn;
	revealSlide: typeof revealSlide;
	bounceScale: typeof bounceScale;
	flip3D: typeof flip3D;
	fade: typeof fade;
	blur: typeof blur;
	fly: typeof fly;
	crossfade: typeof crossfade;

	// Add more transition functions as needed
};

type TransitionParams<T extends keyof TransitionFunctionMap> = Parameters<
	TransitionFunctionMap[T]
>[1];

type MicroanimationParameters<T extends keyof TransitionFunctionMap> = {
	transition: TransitionFunctionMap[T];
	params?: TransitionParams<T>;
	threshold?: number;
	once?: boolean;
	mode?: 'hover' | 'viewport' | 'immediate';
};

function css_to_keyframe(css: string): Keyframe {
	const keyframe: Keyframe = {};
	const parts = css.split(';');

	for (const part of parts) {
		const [property, value] = part.split(':');
		if (!property || value === undefined) break;

		const formatted_property = css_property_to_camelcase(property.trim());
		keyframe[formatted_property] = value.trim();
	}

	return keyframe;
}

function css_property_to_camelcase(property: string): string {
	if (property === 'float') return 'cssFloat';
	if (property === 'offset') return 'cssOffset';
	if (property.startsWith('--')) return property;

	const parts = property.split('-');
	if (parts.length === 1) return parts[0];

	return (
		parts[0] +
		parts
			.slice(1)
			.map((word) => word[0].toUpperCase() + word.slice(1))
			.join('')
	);
}

function getFirstKeyframeOfTransition(transition: TransitionConfig) {
	return css_to_keyframe(transition.css?.(0, 1) || '');
}

function animate(element: HTMLElement, options: TransitionConfig, onFinish: () => void) {
	const { delay = 0, duration = 400, css, tick: tickFn, easing = linear } = options;
	let keyframes: Keyframe[] = [];

	if (css) {
		// Initial state
		const styles = css_to_keyframe(css(0, 1));
		keyframes.push(styles, styles);
	}

	// Create a dummy animation for the delay
	let animation = element.animate(keyframes, { duration: delay });

	animation.onfinish = () => {
		keyframes = [];

		if (css) {
			const n = Math.ceil((duration || 0) / (1000 / 60));

			for (let i = 0; i <= n; i += 1) {
				const t = easing(i / n);
				const styles = css(t, 1 - t);
				keyframes.push(css_to_keyframe(styles));
			}
		}

		animation = element.animate(keyframes, {
			duration: duration || 0,
			fill: 'forwards'
		});

		animation.onfinish = () => {
			tickFn?.(1, 0);
			onFinish();
		};
	};

	return {
		abort() {
			if (animation) {
				animation.cancel();
				animation.effect = null;
				animation.onfinish = () => {};
			}
		},
		reverse(onFinish: () => void) {
			if (animation) {
				animation.onfinish = () => {
					onFinish();
				};
				animation.reverse();
			}
		}
	};
}

export function initHoverAnimation(node: HTMLElement, params: any) {
	let animation: Animation;
	let initialStyles: Partial<CSSStyleDeclaration> = {};

	function start_animation() {
		initialStyles = getComputedStyle(node);
		const transition = params.transition(node, params.params);
		const keyframes = [
			transition.css ? css_to_keyframe(transition.css(1, 1)) : initialStyles
		] as Keyframe[];

		animation = node.animate(keyframes, {
			duration: params.duration ?? 400,
			easing: params.easing || 'cubic-bezier(0.215, 0.61, 0.355, 1)',
			delay: params.delay ?? 0,
			fill: 'both'
		});
	}

	function reverse_animation() {
		if (animation) {
			animation.reverse();
			animation.onfinish = () => {
				Object.assign(node.style, initialStyles);
			};
		}
	}

	node.addEventListener('mouseenter', start_animation);
	node.addEventListener('mouseleave', reverse_animation);

	return {
		destroy() {
			animation?.cancel();
			node.removeEventListener('mouseenter', start_animation);
			node.removeEventListener('mouseleave', reverse_animation);
		}
	};
}

export function microanimation<T extends keyof TransitionFunctionMap>(
	node: HTMLElement,
	{
		transition,
		params = {},
		threshold = 0.5,
		once = true,
		mode = 'viewport'
	}: MicroanimationParameters<T>
): SvelteActionReturnType {
	let observer: IntersectionObserver;
	let animated = false;
	let animation: ReturnType<typeof animate> | undefined;
	let hoverAnimation: Animation | undefined;
	let placeholder: HTMLElement;
	let hovered = false;
	let initialStyles: Partial<CSSStyleDeclaration> = {};

	async function start_animation() {
		if (animated && once) return;
		animated = true;
		const config = transition(node, params);
		// Switch display from placeholder to node

		if (mode === 'viewport') {
			node.parentNode?.removeChild(placeholder);
			await tick();
			node.style.display = placeholder.style.display;
			Object.assign(node.style, getFirstKeyframeOfTransition(config));
		}

		await tick();

		animation?.abort();

		// Replace placeholder with node
		// placeholder.parentNode?.replaceChild(node, placeholder);

		animation = animate(node, config as TransitionConfig, () => {
			animation = undefined;
			if (mode === 'hover') {
				animated = false;
			}
		});
	}

	function start_hover_animation() {
		initialStyles = getComputedStyle(node);
		const transitionCompiled = transition(node, params) as TransitionConfig;
		const { delay = 0, duration = 400, css, tick: tickFn, easing = linear } = transitionCompiled;
		const keyframes: Keyframe[] = [];

		if (css) {
			// Initial state (current styles)
			// keyframes.push(css_to_keyframe(css(0, 1)));

			// Generate intermediate keyframes
			const n = Math.ceil(duration / (1000 / 60));
			for (let i = n; i >= 0; i -= 1) {
				const t = easing(i / n);
				const styles = css(t, 1 - t);
				keyframes.push(css_to_keyframe(styles));
			}
		}

		hoverAnimation = node.animate(keyframes, {
			duration,
			delay,
			fill: 'both',
			easing: 'linear' // We handle easing through keyframes
		});

		hoverAnimation.onfinish = () => {
			tickFn?.(1, 0);
			if (!hovered) {
				// Object.assign(node.style, initialStyles);
			}
		};
	}

	function handle_hover_animation() {
		if (!hovered) {
			hovered = true;
			start_hover_animation();
		}
	}

	function reverse_animation() {
		if (!hovered) return;
		hovered = false;
		animated = false;
		if (hoverAnimation) {
			hoverAnimation.reverse();
			hoverAnimation.onfinish = () => {
				// Object.assign(node.style, initialStyles);
			};
		}
	}

	function setup() {
		// Create a placeholder element with the same dimensions
		if (mode === 'viewport') {
			placeholder = document.createElement('div');
			const computedStyle = window.getComputedStyle(node);

			Object.assign(placeholder.style, {
				width: computedStyle.width,
				minWidth: computedStyle.minWidth,
				height: computedStyle.height,
				minHeight: computedStyle.minHeight,
				margin: computedStyle.margin,
				padding: computedStyle.padding,
				border: computedStyle.border,
				boxSizing: computedStyle.boxSizing,
				display: computedStyle.display
			});

			// Replace node with placeholder

			node.parentNode?.insertBefore(placeholder, node);
			node.style.display = 'none';

			observer = new IntersectionObserver(
				(entries) => {
					const [entry] = entries;
					if (entry.isIntersecting) {
						start_animation();
						if (once) {
							observer.disconnect();
						}
					}
				},
				{ threshold }
			);

			observer.observe(placeholder);
		} else if (mode === 'hover') {
			node.addEventListener('mouseenter', handle_hover_animation);
			node.addEventListener('mouseleave', reverse_animation);
		} else if (mode === 'immediate') {
			start_animation();
		}
	}

	setup();

	return {
		destroy() {
			animation?.abort();
			observer?.disconnect();
			node.removeEventListener('mouseenter', handle_hover_animation);
			node.removeEventListener('mouseleave', reverse_animation);

			// Ensure node is visible if action is destroyed
			if (mode === 'viewport') {
				placeholder.parentNode?.replaceChild(node, placeholder);
			}
		},
		update(newParams: MicroanimationParameters<T>) {
			animation?.abort();
			if (observer) {
				observer.disconnect();
			}
			transition = newParams.transition;
			params = newParams.params || {};
			threshold = newParams.threshold ?? 0.5;
			once = newParams.once ?? true;
			mode = newParams.mode ?? 'viewport';
			setup();
		}
	};
}
