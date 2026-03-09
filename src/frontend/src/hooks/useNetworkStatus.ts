/**
 * useNetworkStatus
 *
 * Wraps useActor to provide timeout-aware network status:
 * - actorReady: true when the actor is available
 * - isConnecting: true while still waiting
 * - connectionTimedOut: true after the timeout threshold with no actor
 * - isFetching: proxied from useActor
 * - actor: proxied from useActor
 */
import { useEffect, useRef, useState } from "react";
import { useActor } from "./useActor";

export interface NetworkStatus {
  actor: ReturnType<typeof useActor>["actor"];
  isFetching: boolean;
  actorReady: boolean;
  isConnecting: boolean;
  connectionTimedOut: boolean;
}

/**
 * @param timeoutMs - milliseconds before connectionTimedOut becomes true
 *                    (defaults to 10 000 ms)
 */
export function useNetworkStatus(timeoutMs = 10_000): NetworkStatus {
  const { actor, isFetching } = useActor();
  const [connectionTimedOut, setConnectionTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start / reset the timeout whenever isFetching or actor changes
  useEffect(() => {
    if (actor) {
      // Actor arrived — clear any pending timer and reset the flag
      if (timerRef.current) clearTimeout(timerRef.current);
      setConnectionTimedOut(false);
      return;
    }

    if (isFetching || !actor) {
      // Still waiting — start the timer if not already running
      if (!timerRef.current) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setConnectionTimedOut(true);
        }, timeoutMs);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [actor, isFetching, timeoutMs]);

  const actorReady = !!actor;
  const isConnecting = !actorReady && (isFetching || !connectionTimedOut);

  return { actor, isFetching, actorReady, isConnecting, connectionTimedOut };
}
