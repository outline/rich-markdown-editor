import { useLayoutEffect, useState } from "react";

export default function useViewportHeight(): number | void {
  const [height, setHeight] = useState<number>(
    () => window.visualViewport?.height || window.innerHeight
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      setHeight(() => window.visualViewport?.height || window.innerHeight);
    };

    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, []);

  return height;
}
