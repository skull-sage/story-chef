```js
function replaceMarkWithAtom(markType, atomType, attrs = {}) {
  return function(state, dispatch) {
    const { $from, empty } = state.selection;
    if (!empty) return false; // Ensure it's a cursor selection

    // Find the mark at the current cursor position
    const mark = markType.isInSet(state.storedMarks || $from.marks());
    if (!mark) return false;

    // Determine the boundaries of this mark
    let start = $from.pos, end = $from.pos;
    const node = $from.parent;

    // Find start boundary
    $from.parent.forEach((child, offset) => {
      if (child.isText && markType.isInSet(child.marks)) {
        let childStart = $from.start() + offset;
        let childEnd = childStart + child.nodeSize;
        if (childStart <= $from.pos && childEnd >= $from.pos) {
          start = childStart;
          end = childEnd;
        }
      }
    });

    if (dispatch) {
      const atomNode = atomType.create(attrs);
      // Replace the entire marked range with the atom node
      dispatch(state.tr.replaceWith(start, end, atomNode));
    }
    return true;
  };
}
```
