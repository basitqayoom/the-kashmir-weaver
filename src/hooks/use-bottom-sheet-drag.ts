import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

// Avoids a visible-then-reset flash from a same-tick setState in a plain effect.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const MD_MEDIA_QUERY = "(min-width: 768px)";

function subscribeMediaQuery(query: string, callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function useIsMdUp() {
  return useSyncExternalStore(
    (callback) => subscribeMediaQuery(MD_MEDIA_QUERY, callback),
    () => window.matchMedia(MD_MEDIA_QUERY).matches,
    () => false,
  );
}

export function useBottomSheetDrag({
  enabled,
  panelRef,
  onDismiss,
}: {
  enabled: boolean;
  panelRef: RefObject<HTMLElement | null>;
  onDismiss: () => void;
}) {
  const isMdUp = useIsMdUp();
  const isBottomSheet = !isMdUp;
  const isSidePanel = isMdUp;
  const dragActive = enabled && isBottomSheet;

  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [panelHeight, setPanelHeight] = useState(480);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const dismissingRef = useRef(false);

  const resetDrag = useCallback(() => {
    dragYRef.current = 0;
    setDragY(0);
    setIsDragging(false);
    pointerIdRef.current = null;
    dismissingRef.current = false;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (isMdUp) resetDrag();
  }, [isMdUp, resetDrag]);

  useIsomorphicLayoutEffect(() => {
    resetDrag();
  }, [enabled, resetDrag]);

  const getPanelHeight = useCallback(() => {
    return panelRef.current?.offsetHeight ?? 480;
  }, [panelRef]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragActive || dismissingRef.current) return;
      if (event.button !== 0) return;

      pointerIdRef.current = event.pointerId;
      startYRef.current = event.clientY;
      dragYRef.current = 0;
      setDragY(0);
      setIsDragging(true);
      // Measured here (event handler), not during render — refs can only be read outside render.
      setPanelHeight(getPanelHeight());
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dragActive, getPanelHeight],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragActive || !isDragging || pointerIdRef.current !== event.pointerId) {
        return;
      }

      const next = Math.max(0, event.clientY - startYRef.current);
      dragYRef.current = next;
      setDragY(next);
    },
    [dragActive, isDragging],
  );

  const finishDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragActive || pointerIdRef.current !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pointerIdRef.current = null;
      setIsDragging(false);

      const height = getPanelHeight();
      const threshold = Math.min(height * 0.22, 140);

      if (dragYRef.current > threshold) {
        if (dismissingRef.current) return;
        dismissingRef.current = true;
        dragYRef.current = height;
        setDragY(height);
        window.setTimeout(onDismiss, 280);
      } else {
        dragYRef.current = 0;
        setDragY(0);
      }
    },
    [dragActive, getPanelHeight, onDismiss],
  );

  const overlayOpacity =
    dragActive && dragY > 0
      ? Math.max(0.12, 1 - (dragY / panelHeight) * 0.88)
      : undefined;

  return {
    dragY,
    isDragging,
    isBottomSheet,
    isSidePanel,
    overlayOpacity,
    dragHandleProps: dragActive
      ? {
          onPointerDown,
          onPointerMove,
          onPointerUp: finishDrag,
          onPointerCancel: finishDrag,
          style: { touchAction: "none" as const, cursor: "grab" as const },
        }
      : {},
  };
}
