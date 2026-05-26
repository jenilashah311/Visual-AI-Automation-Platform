import { create } from "zustand";
import type { ExecutionLog } from "../types/workflow";

interface ExecutionState {
  isRunning: boolean;
  executionId: string | null;
  nodeLogs: Record<string, ExecutionLog>;
  finalOutput: string | null;
  error: string | null;

  startExecution: (executionId: string) => void;
  updateNodeLog: (nodeId: string, log: ExecutionLog) => void;
  finishExecution: (output: string) => void;
  failExecution: (error: string) => void;
  resetExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isRunning: false,
  executionId: null,
  nodeLogs: {},
  finalOutput: null,
  error: null,

  startExecution: (executionId) =>
    set({
      isRunning: true,
      executionId,
      nodeLogs: {},
      finalOutput: null,
      error: null,
    }),

  updateNodeLog: (nodeId, log) =>
    set((state) => ({
      nodeLogs: { ...state.nodeLogs, [nodeId]: log },
    })),

  finishExecution: (output) =>
    set({
      isRunning: false,
      finalOutput: output,
    }),

  failExecution: (error) =>
    set({
      isRunning: false,
      error,
    }),

  resetExecution: () =>
    set({
      isRunning: false,
      executionId: null,
      nodeLogs: {},
      finalOutput: null,
      error: null,
    }),
}));
