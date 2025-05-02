import { createScope, Scope } from 'animejs'; // Import Scope type from animejs
import { onMounted, onUnmounted, Ref } from 'vue';

// Define the structure for each animation definition
interface AnimeControlConfig {
  methodName: string;
  // The function that defines/controls the animation.
  // It will receive any arguments passed to the trigger function for this method.
  // Inside this function, you can use reactive values from your component.
  animationFunction: (...args: any[]) => any;
}

interface AnimeConfig {
  root: Ref<HTMLElement | null>;
  scope: Ref<ReturnType<typeof createScope> | null>;
  animeFunctions: Array<() => void>;
}

// Define the main configuration interface for the composable
interface AnimeControllerConfig {
  root: Ref<HTMLElement | null>; // The root element for the animejs scope
  scope: Ref<Scope | null>; // A ref to hold the animejs Scope instance
  animations: AnimeControlConfig[]; // Array of animation definitions
}

/**
 * A Vue composable to manage multiple animejs animations within a single scope
 * and trigger them programmatically by name.
 *
 * The animationFunction within each config object is where you define your animejs
 * timeline or animation. These functions can access and use reactive values
 * (like refs or reactive objects) defined in the component where useAnimeController
 * is used. When a specific animation is triggered, the animationFunction for that
 * method is executed, using the current state of any reactive values it accesses.
 */
export const useAnimeController = ({ root, scope, animations }: AnimeControllerConfig) => {

  onMounted(() => {
    if (!root.value) {
      console.error('useAnimeController: Root element not available. Scope cannot be created.');
      return;
    }

    // Create the animejs scope tied to the root element
    // The .add() method is used to define methods available on the scope instance.
    scope.value = createScope({ root: root.value }).add((self) => {
      // Loop through the provided animations and add them as methods to the scope
      animations.forEach(({ methodName, animationFunction }) => {
        if (!methodName || typeof animationFunction !== 'function') {
          console.error(`useAnimeController: Invalid animation configuration provided. Each item must have a 'methodName' (string) and 'animationFunction' (function).`);
          return; // Skip this invalid entry
        }

        // Add the user-provided animationFunction as a method to the animejs scope instance (self)
        // When this method is called via scope.methods[methodName](...),
        // the wrapped function here executes, which in turn calls the user's animationFunction.
        self.add(methodName, (...args: any[]) => {
          try {
            // Execute the user-provided function. This is where the actual
            // animejs calls happen and where reactive values are read.
            animationFunction(...args);
          } catch (error) {
            console.error(`useAnimeController: Error executing animation function for method '${methodName}':`, error);
          }
        });
      });
    });
  });

  onUnmounted(() => {
    // Revert the scope on component unmount to clean up animations
    if (scope.value) {
      scope.value.revert();
      scope.value = null; // Optional: help garbage collection
    }
  });

  /**
   * Triggers a specific animation method that was added to the animejs scope.
   *
   * @param methodName The string name of the animation method to trigger (as defined in your animations array).
   * @param args Any arguments to pass along to the specific animationFunction.
   */
  const trigger = (methodName: string, ...args: any[]) => {
    if (!scope.value) {
      console.warn(`useAnimeController: Scope not ready. Cannot trigger method '${methodName}'.`);
      // Optionally, you could queue triggers here if needed, but direct call is simpler.
      return;
    }

    // Access the methods object on the scope instance and find the requested method
    if (!scope.value.methods || typeof scope.value.methods[methodName] !== 'function') {
      console.error(`useAnimeController: Method '${methodName}' not found on the scope. Make sure it's included in the 'animations' array.`);
      return;
    }

    // Call the specific method on the scope instance, passing along arguments
    scope.value.methods[methodName](...args);
  };

  // Return the trigger function which is used to start animations by name
  return trigger;
};



export const useAnime = ({ root, scope, animeFunctions }: AnimeConfig) => {
  onMounted(() => {
    if (!root.value) {
      console.error('Root element not available for useAnime');
      return;
    }

    scope.value = createScope({ root: root.value }).add((self) => {
      animeFunctions.forEach((setupFunc) => {
        if (typeof setupFunc === 'function') {
          setupFunc();
        } else {
          console.error('Provided setup item is not a function:', setupFunc);
        }
      });
    });
  });

  onUnmounted(() => {
    if (scope.value) {
      scope.value.revert();
    }
  });
};