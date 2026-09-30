/* Web Worker wrapper so the computer can think without freezing the animations. */
importScripts('engine.js', 'ai.js');
self.onmessage = e => {
  const { id, payload } = e.data;
  let move = null;
  try { move = aiChooseMove(payload); } catch (err) { move = null; }
  self.postMessage({ id, move });
};
