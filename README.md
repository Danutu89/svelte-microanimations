# Svelte Micro Animations

A lightweight library for Svelte that adds viewport-triggered transitions to your elements. Perfect for creating engaging scroll animations and micro-interactions.

## Features

- 🎯 Triggers animations when elements enter the viewport
- 🎨 Includes 6 customizable transitions
- 🔄 Supports all Svelte easing functions
- 📦 Zero dependencies (besides Svelte)
- 🎭 TypeScript support with full type inference
- 🖼️ Prevents layout shifts with placeholder elements

## Installation

```bash
npm install svelte-microanimations
# or
pnpm add svelte-microanimations
# or
yarn add svelte-microanimations
```

## Usage

### Basic Usage

```svelte
<script>
	import { microanimation } from 'svelte-microanimations';
	import { fadeSlide } from 'svelte-microanimations/transitions';
	import { cubicOut } from 'svelte/easing';
</script>

<div
	use:microanimation={{
		transition: fadeSlide,
		params: { duration: 800, easing: cubicOut }
	}}
>
	This will animate when it enters the viewport
</div>
```

### Available Transitions

Each transition accepts common parameters plus its own specific parameters:

#### Common Parameters (all transitions)

```typescript
{
    duration?: number;   // Duration in milliseconds
    delay?: number;      // Delay before animation starts
    easing?: Function;   // Svelte easing function
}
```

#### 1. fadeSlide

Combines fade with directional movement.

```typescript
type DirectionalParams = {
    y?: number;     // Vertical slide distance in pixels
    x?: number;     // Horizontal slide distance in pixels
}

// Usage
<div use:microanimation={{
    transition: fadeSlide,
    params: {
        duration: 800,
        easing: cubicOut,
        y: 50,      // Slides up 50px
        x: 0        // No horizontal movement
    }
}} />
```

#### 2. popScale

Scales and fades element into view.

```typescript
type ScaleParams = {
    start?: number;     // Initial scale value (0 to 1)
    opacity?: number;   // Initial opacity value (0 to 1)
}

// Usage
<div use:microanimation={{
    transition: popScale,
    params: {
        duration: 700,
        easing: elasticOut,
        start: 0.95,    // Starts slightly smaller
        opacity: 0      // Starts fully transparent
    }
}} />
```

#### 3. spinIn

Rotates and fades element into view.

```typescript
type RotateParams = {
    degrees?: number;   // Rotation amount in degrees
    y?: number;        // Vertical offset in pixels
}

// Usage
<div use:microanimation={{
    transition: spinIn,
    params: {
        duration: 600,
        easing: cubicOut,
        degrees: 180,   // Half rotation
        y: 20          // Small upward movement
    }
}} />
```

#### 4. revealSlide

Reveals content with a sliding mask effect.

```typescript
// Only uses common parameters
// Usage
<div use:microanimation={{
    transition: revealSlide,
    params: {
        duration: 800,
        easing: cubicInOut
    }
}} />
```

#### 5. bounceScale

Scales in with a bouncy effect.

```typescript
// Only uses common parameters
// Usage
<div use:microanimation={{
    transition: bounceScale,
    params: {
        duration: 800,
        easing: elasticOut    // Best with elastic or bounce easing
    }
}} />
```

#### 6. flip3D

Flips element in 3D space.

```typescript
// Only uses common parameters
// Usage
<div use:microanimation={{
    transition: flip3D,
    params: {
        duration: 800,
        easing: cubicOut
    }
}} />
```

### Recommended Easing Functions

Different transitions work best with specific easing functions:

- `fadeSlide`: `cubicOut`, `quartOut`
- `popScale`: `elasticOut`, `bounceOut`
- `spinIn`: `cubicOut`, `quartOut`
- `revealSlide`: `cubicInOut`, `quartInOut`
- `bounceScale`: `elasticOut`, `bounceOut`
- `flip3D`: `cubicOut`, `quartOut`

Import easing functions from Svelte:

```typescript
import { cubicOut, cubicInOut, quartOut, quartInOut, elasticOut, bounceOut } from 'svelte/easing';
```

### Configuration Options

The `microanimation` action accepts the following options:

```typescript
type MicroanimationParameters = {
	transition: TransitionFunction; // The transition to apply
	params?: TransitionParams; // Parameters for the transition
	threshold?: number; // Viewport intersection threshold (0 to 1)
	once?: boolean; // Whether to trigger only once
};
```

#### Common Parameters for All Transitions

- `duration`: Animation duration in milliseconds (default varies by transition)
- `delay`: Delay before animation starts in milliseconds (default: 0)
- `easing`: Svelte easing function (default varies by transition)

### TypeScript Support

The library includes full TypeScript support with type inference for transition parameters:

```typescript
import type { TransitionParamsMap } from 'svelte-microanimations';

// TypeScript will show available parameters for spinIn
use:microanimation<'spinIn'>{{
    transition: spinIn,
    params: {
        duration: 800,
        easing: bounceOut,
        degrees: 180,  // TypeScript knows this is available
        y: 20         // And this too
    }
}}
```

### Examples

#### Staggered List Animation

```svelte
<script>
	import { microanimation } from 'svelte-microanimations';
	import { fadeSlide } from 'svelte-microanimations/transitions';
	import { cubicOut } from 'svelte/easing';

	let items = ['Item 1', 'Item 2', 'Item 3'];
</script>

{#each items as item, i}
	<div
		use:microanimation={{
			transition: fadeSlide,
			params: {
				duration: 600,
				delay: i * 100,
				y: 50,
				easing: cubicOut
			}
		}}
	>
		{item}
	</div>
{/each}
```

#### Combining with Svelte's Built-in Transitions

```svelte
<script>
	import { microanimation } from 'svelte-microanimations';
	import { fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	const customTransition = (node, params) => ({
		...fade(node, params),
		easing: elasticOut
	});
</script>

<div
	use:microanimation={{
		transition: customTransition,
		params: { duration: 1000 }
	}}
>
	Custom transition
</div>
```

## Browser Support

- Requires browsers that support the Intersection Observer API and Web Animations API
- Modern browsers (Chrome, Firefox, Safari, Edge)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
