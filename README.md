# Using Anime.js and v-anime in Vue/Nuxt.js

This document explains how to integrate the `animejs` library for animations and the `v-anime` wrapper for easier management within a Vue.js or Nuxt.js application. We will consider **usage in Nuxt 3** for the example.

## 1. Installation

First, ensure you have the necessary packages installed:

```bash
npm install animejs v-anime
# or
yarn add animejs v-anime
```

## 2. Setup and Imports

In your Vue component (`<script setup lang="ts">` section), import the required functions:

```typescript
import { animate, createSpring, createDraggable } from 'animejs';
import { useAnime, useAnimeController } from 'v-anime';

// Refs for the root element and animation scope
const root = ref(null);
const scope = ref(null); // Optional: for scoping animations if needed

// Example state variables (if needed for controlled animations)
const clockwise = ref(0);
const antiClockwise = ref(0);
```

-   `animate`, `createSpring`, `createDraggable`: Core functions from `animejs` for creating animations.
-   `useAnime`, `useAnimeController`: Composables from `v-anime` to manage animations.
-   `root`: A `ref` attached to the main container element in your template. This is often required by `v-anime`.
-   `scope`: A `ref` for scoping animations to specific elements within the `root` container.

## 3. Automatic Animations (`useAnime`)

`useAnime` is used to run animations automatically when the component mounts. Define your animation logic in separate functions.

```typescript
// Define animation functions using animejs
const heartbeatLogo = () => {
    animate('.logo', { // Target elements with the class 'logo'
        scale: [
            { to: 1.25, ease: 'inOut(3)', duration: 200 },
            { to: 1, ease: createSpring({ stiffness: 300 }) } // Spring effect
        ],
        loop: true, // Repeat indefinitely
        loopDelay: 250, // Delay between loops
    });
}

const dragableLogo = () => {
    createDraggable('.logo', { // Make elements with class 'logo' draggable
        container: [0, 0, 0, 0], // Optional: constrain movement
        releaseEase: createSpring({ stiffness: 200 }) // Spring back effect on release
    });
}

// Register the automatic animations with useAnime
useAnime({
    root: root, // Pass the root element ref
    scope: scope, // Pass the scope ref
    animeFunctions: [heartbeatLogo, dragableLogo] // Array of functions to run on mount
  })
```

-   Define functions (`heartbeatLogo`, `dragableLogo`) that use `animejs` functions (`animate`, `createDraggable`).
-   Pass these functions in an array to the `animeFunctions` option of `useAnime`.
-   These animations will start automatically when the component associated with the `root` ref mounts.

## 4. Controlled Animations (`useAnimeController`)

`useAnimeController` allows you to define animations that can be triggered manually (e.g., by button clicks).

```typescript
// Define functions for controlled animations
const rotateLogoClockwise = () => {
    console.log("Triggering Clockwise:", clockwise.value);
    animate('.logo', {
        rotate: clockwise.value * 360, // Rotate based on state
        ease: 'out(4)',
        duration: 1500,
    });
};

const rotateLogoAntiClockwise = () => {
    console.log("Triggering AntiClockwise:", antiClockwise.value);
    animate('.logo', {
        rotate: -antiClockwise.value * 360, // Rotate based on state
        ease: 'out(4)',
        duration: 1500,
    });
};

// Configure the controlled animations
const animations = [
    {
        methodName: 'rotateClockwise', // Unique name to trigger this animation
        animationFunction: rotateLogoClockwise // The function to execute
    },
    {
        methodName: 'rotateAntiClockwise',
        animationFunction: rotateLogoAntiClockwise
    }
    // Add more animation configurations here...
];

// Get the trigger function from useAnimeController
const trigger = useAnimeController({
    root: root,
    scope: scope,
    animations: animations, // Pass the configuration array
});

// Example methods to trigger animations
const clockClick = () => {
    clockwise.value += 1; // Update state
    trigger('rotateClockwise'); // Trigger animation by its methodName
};

const antiClockClick = () => {
    antiClockwise.value += 1; // Update state
    trigger('rotateAntiClockwise'); // Trigger animation by its methodName
};
```

-   Define animation functions (`rotateLogoClockwise`, `rotateLogoAntiClockwise`) similar to automatic ones.
-   Create a configuration array (`animations`) where each object maps a unique `methodName` to its corresponding `animationFunction`.
-   Call `useAnimeController` with this configuration.
-   `useAnimeController` returns a `trigger` function.
-   Call `trigger('methodName')` to execute the desired animation.

## 5. Template Integration

In your `<template>`, attach the `root` ref to the main container and ensure your target elements (e.g., `.logo`) exist.

```vue
<template>
    <div ref="root" class="w-full h-screen flex flex-col ...">
        <!-- The element(s) to be animated -->
        <NuxtImg :src="link" class="logo rounded-md shadow-2xl" />

        <div class="flex gap-4 ...">
            <!-- Buttons to trigger controlled animations -->
            <button @click="clockClick" class="...">
                Clockwise:{{ clockwise }}
            </button>
            <button @click="antiClockClick" class="...">
                Anticlockwise:{{ antiClockwise }}
            </button>
        </div>
    </div>
</template>
```

-   `ref="root"` connects the template element to the `root` ref in the script.
-   Elements with `class="logo"` are the targets for the animations defined using the `.logo` selector.
-   Buttons use `@click` handlers to call methods (`clockClick`, `antiClockClick`) that trigger the controlled animations.

## Conclusion

`animejs` provides powerful animation capabilities, while `v-anime` offers convenient composables (`useAnime`, `useAnimeController`) to integrate and manage these animations declaratively within Vue/Nuxt.js components, separating automatic and controlled animation logic effectively.
