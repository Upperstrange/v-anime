import { createScope, Scope } from 'animejs'; 
import { onMounted, onUnmounted, Ref } from 'vue';


interface AnimeControlConfig {
  methodName: string;

  animationFunction: (...args: any[]) => any;
}

interface AnimeConfig {
  root: Ref<HTMLElement | null>;
  scope: Ref<ReturnType<typeof createScope> | null>;
  animeFunctions: Array<() => void>;
}


interface AnimeControllerConfig {
  root: Ref<HTMLElement | null>; 
  scope: Ref<Scope | null>; 
  animations: AnimeControlConfig[]; 
}


export const useAnimeController = ({ root, scope, animations }: AnimeControllerConfig) => {

  onMounted(() => {
    if (!root.value) {
      console.error('useAnimeController: Root element not available. Scope cannot be created.');
      return;
    }


    scope.value = createScope({ root: root.value }).add((self) => {

      animations.forEach(({ methodName, animationFunction }) => {
        if (!methodName || typeof animationFunction !== 'function') {
          console.error(`useAnimeController: Invalid animation configuration provided. Each item must have a 'methodName' (string) and 'animationFunction' (function).`);
          return; 
        }

        self.add(methodName, (...args: any[]) => {
          try {

            animationFunction(...args);
          } catch (error) {
            console.error(`useAnimeController: Error executing animation function for method '${methodName}':`, error);
          }
        });
      });
    });
  });

  onUnmounted(() => {

    if (scope.value) {
      scope.value.revert();
      scope.value = null; 
    }
  });

 
  const trigger = (methodName: string, ...args: any[]) => {
    if (!scope.value) {
      console.warn(`useAnimeController: Scope not ready. Cannot trigger method '${methodName}'.`);

      return;
    }


    if (!scope.value.methods || typeof scope.value.methods[methodName] !== 'function') {
      console.error(`useAnimeController: Method '${methodName}' not found on the scope. Make sure it's included in the 'animations' array.`);
      return;
    }


    scope.value.methods[methodName](...args);
  };


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