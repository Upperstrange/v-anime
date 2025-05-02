<script setup lang="ts">
import { animate, createSpring, createDraggable} from 'animejs';
import {useAnime, useAnimeController} from 'v-anime';

const root = ref(null);
const scope = ref(null);
const clockwise = ref(0);
const antiClockwise = ref(0);

const link = 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQlxYJSWN-aONm-ciMzSGdB_Ak6Kys_Q8t5Z7GDdIyIJRCN539h-swgrDctTMUgBr_Ye8_6blJl1TIIWUO6Xat8I1kwSaKZk3q5Grvqig'

//////////////////////////////// AUTOMATIC ANIMATIONS //////////////////////////////////////////////////////
const heartbeatLogo = () => {
    animate('.logo', {
        scale: [
            { to: 1.25, ease: 'inOut(3)', duration: 200 },
            { to: 1, ease: createSpring({ stiffness: 300 }) }
        ],
        loop: true,
        loopDelay: 250,
    });
}
const dragableLogo = () => {
    createDraggable('.logo', {
        container: [0, 0, 0, 0],
        releaseEase: createSpring({ stiffness: 200 })
    });
}

useAnime({
    root: root,
    scope: scope,
    animeFunctions: [heartbeatLogo, dragableLogo]
  })

/////////////////////////////// CONTROLLED ANIMATIONS //////////////////////////////////////////////////////
const rotateLogoClockwise = () => {
    console.log("Triggering Clockwise:", clockwise.value);
    animate('.logo', {
        rotate: clockwise.value * 360,
        ease: 'out(4)',
        duration: 1500,
    });
};

const rotateLogoAntiClockwise = () => {
    console.log("Triggering AntiClockwise:", antiClockwise.value); 
    animate('.logo', {
        rotate: -antiClockwise.value * 360,
        ease: 'out(4)',
        duration: 1500,
    });
};

const animations = [
    {
        methodName: 'rotateClockwise',
        animationFunction: rotateLogoClockwise
    },
    {
        methodName: 'rotateAntiClockwise',
        animationFunction: rotateLogoAntiClockwise
    }
    // Add more animation configurations here...
];

const trigger = useAnimeController({
    root: root,
    scope: scope,
    animations: animations,
});

const clockClick = () => {
    clockwise.value += 1;
    trigger('rotateClockwise');
};

const antiClockClick = () => {
    antiClockwise.value += 1;
    trigger('rotateAntiClockwise');
};

</script>

<template>
    <div ref="root" class="w-full h-screen flex flex-col space-y-8 items-center justify-center bg-neutral-50">
        <NuxtImg :src="link" class="logo rounded-md shadow-2xl" />
        <div class="flex gap-4 w-fit h-fit p-4">
            <button @click="clockClick"
                class="flex items-center justify-center w-50 h-fit p-4 bg-secondary-200 ring ring-secondary-500 shadow-2xl rounded-md text-md font-md text-shadow-sm text-secondary-800">Clockwise:{{
                    clockwise }}</button>
            <button @click="antiClockClick"
                class="flex items-center justify-center w-50 h-fit p-4 bg-primary-200 ring ring-primary-500 shadow-2xl rounded-md text-md font-md text-primary-800 text-shadow-sm">Anticlockwise:{{
                    antiClockwise }}</button>
        </div>
    </div>
</template>