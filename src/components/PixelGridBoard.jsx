import React from 'react';

const PixelCell = React.memo(({ r, c, val, color, onMouseDown, onMouseEnter }) => {
  return (
    <div
      className="pixel-cell"
      style={{
        backgroundColor: val === 0 ? 'transparent' : color,
        boxShadow: val === 0 
          ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.15)' 
          : 'inset 0 0 0 1px rgba(0, 0, 0, 0.18)'
      }}
      onMouseDown={(e) => onMouseDown(e, r, c)}
      onMouseEnter={(e) => onMouseEnter(e, r, c)}
    />
  );
});

PixelCell.displayName = 'PixelCell';

const PixelGridBoard = React.memo(({
  gridData,
  gridWidth,
  gridHeight,
  colorMap,
  isReadOnly,
  handleMouseDown,
  handleMouseEnter,
  gridContainerRef
}) => {
  return (
    <div className="workspace-scroll-area">
      <div
        className="pixel-art-grid-board"
        ref={gridContainerRef}
        style={{
          '--cols': gridWidth,
          '--rows': gridHeight,
          pointerEvents: isReadOnly ? 'none' : 'auto'
        }}
      >
        {gridData.map((row, r) =>
          row.map((val, c) => (
            <PixelCell
              key={`${r}-${c}`}
              r={r}
              c={c}
              val={val}
              color={colorMap[val]}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
            />
          ))
        )}
      </div>
    </div>
  );
});

PixelGridBoard.displayName = 'PixelGridBoard';

export default PixelGridBoard;
