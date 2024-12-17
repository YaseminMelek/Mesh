import { onCleanup, onMount } from "solid-js";
import p5 from "p5";

const P5Wrapper = ({sketch}) => {
  let sketchContainer;

  onMount(() => {
    const p5_sketch = new p5(sketch, sketchContainer);

    onCleanup(() => {
      p5_sketch.remove();
    });
  });

  return <div ref={sketchContainer}></div>;
};

export default P5Wrapper;