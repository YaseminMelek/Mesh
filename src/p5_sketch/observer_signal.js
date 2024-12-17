import { createSignal } from "solid-js";

export const [selected_count, setSelectedCount] = createSignal(0);
export const [push_signal, setPush] = createSignal(1);
export const [op_signal, setOpSignal] = createSignal(''); // select, cut, isolate, move_x, move_y, dup
export const [cut_signal, setCutSignal] = createSignal(0);
export const [isolate_signal, setIsolateSignal] = createSignal(0);
export const [move_x_signal, setMoveXSignal] = createSignal(0);
export const [move_y_signal, setMoveYSignal] = createSignal(0);
export const [dup_signal, setDupSignal] = createSignal(0);
export const [pop_signal, setPop] = createSignal(0);
export const [select_signal, setSelect] = createSignal(0);
export const [currentKeyInput, setKeyInput] = createSignal(1);
export const [varKey, setVarKey] = createSignal(0);
export const [currentVal, setCurrentVal] = createSignal(0);
export const [handSignal, setHandSignal] = createSignal(0);
