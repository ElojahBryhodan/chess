import { useState } from "react";

import WhitePawn from "./svgs/white-pawn.svg";
import WhiteRook from "./svgs/white-rook.svg";
import WhiteKnight from "./svgs/white-knight.svg";
import WhiteBishop from "./svgs/white-bishop.svg";
import WhiteQueen from "./svgs/white-queen.svg";
import WhiteKing from "./svgs/white-king.svg";

import BlackPawn from "./svgs/black-pawn.svg";
import BlackRook from "./svgs/black-rook.svg";
import BlackKnight from "./svgs/black-knight.svg";
import BlackBishop from "./svgs/black-bishop.svg";
import BlackQueen from "./svgs/black-queen.svg";
import BlackKing from "./svgs/black-king.svg";

type Piece = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type Color = "white" | "black";
type Cell = { piece: Piece; color: Color } | null;
type Move = { row: number; col: number; capture: boolean };

function App() {
  const initBoard = (): Cell[][] => {
    const emptyRow: Cell[] = Array(8).fill(null);
    return [
      [
        { piece: "rook", color: "black" },
        { piece: "knight", color: "black" },
        { piece: "bishop", color: "black" },
        { piece: "queen", color: "black" },
        { piece: "king", color: "black" },
        { piece: "bishop", color: "black" },
        { piece: "knight", color: "black" },
        { piece: "rook", color: "black" },
      ],
      Array<Cell>(8).fill({ piece: "pawn", color: "black" }),
      ...Array(4).fill(emptyRow),
      Array<Cell>(8).fill({ piece: "pawn", color: "white" }),
      [
        { piece: "rook", color: "white" },
        { piece: "knight", color: "white" },
        { piece: "bishop", color: "white" },
        { piece: "queen", color: "white" },
        { piece: "king", color: "white" },
        { piece: "bishop", color: "white" },
        { piece: "knight", color: "white" },
        { piece: "rook", color: "white" },
      ],
    ];
  };

  const [board, setBoard] = useState<Cell[][]>(initBoard);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [turn, setTurn] = useState<Color>("black");
  const [check, setCheck] = useState<Color | null>(null);
  const [winner, setWinner] = useState<Color | null>(null);
  const [pendingCheck, setPendingCheck] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const icons: Record<Color, Record<Piece, string>> = {
    white: {
      pawn: WhitePawn,
      rook: WhiteRook,
      knight: WhiteKnight,
      bishop: WhiteBishop,
      queen: WhiteQueen,
      king: WhiteKing,
    },
    black: {
      pawn: BlackPawn,
      rook: BlackRook,
      knight: BlackKnight,
      bishop: BlackBishop,
      queen: BlackQueen,
      king: BlackKing,
    },
  };

  // removed renderPiece helper; inline responsive <img> is used instead

  const isInBounds = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8;

  const getPossibleMoves = (row: number, col: number, cell: Cell): Move[] => {
    if (!cell) return [];
    const moves: Move[] = [];
    const color = cell.color;

    switch (cell.piece) {
      case "pawn": {
        const dir = color === "white" ? -1 : 1;
        const startRow = color === "white" ? 6 : 1;
        const nextRow = row + dir;
        if (isInBounds(nextRow, col) && board[nextRow][col] === null) {
          moves.push({ row: nextRow, col, capture: false });
          if (row === startRow && board[nextRow + dir]?.[col] === null) {
            moves.push({ row: nextRow + dir, col, capture: false });
          }
        }
        for (let dc of [-1, 1]) {
          const c = col + dc;
          if (isInBounds(nextRow, c) && board[nextRow][c]?.color !== color && board[nextRow][c] !== null) {
            moves.push({ row: nextRow, col: c, capture: true });
          }
        }
        break;
      }
      case "rook": {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dr, dc] of dirs) {
          let r = row + dr;
          let c = col + dc;
          while (isInBounds(r, c)) {
            if (board[r][c] === null) moves.push({ row: r, col: c, capture: false });
            else {
              if (board[r][c]?.color !== color) moves.push({ row: r, col: c, capture: true });
              break;
            }
            r += dr; c += dc;
          }
        }
        break;
      }
      case "bishop": {
        const dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of dirs) {
          let r = row + dr;
          let c = col + dc;
          while (isInBounds(r, c)) {
            if (board[r][c] === null) moves.push({ row: r, col: c, capture: false });
            else {
              if (board[r][c]?.color !== color) moves.push({ row: r, col: c, capture: true });
              break;
            }
            r += dr; c += dc;
          }
        }
        break;
      }
      case "queen": {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of dirs) {
          let r = row + dr;
          let c = col + dc;
          while (isInBounds(r, c)) {
            if (board[r][c] === null) moves.push({ row: r, col: c, capture: false });
            else {
              if (board[r][c]?.color !== color) moves.push({ row: r, col: c, capture: true });
              break;
            }
            r += dr; c += dc;
          }
        }
        break;
      }
      case "knight": {
        const jumps = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        for (const [dr, dc] of jumps) {
          const r = row + dr;
          const c = col + dc;
          if (isInBounds(r, c) && (board[r][c] === null || board[r][c]?.color !== color)) {
            moves.push({ row: r, col: c, capture: board[r][c] !== null });
          }
        }
        break;
      }
      case "king": {
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of dirs) {
          const r = row + dr;
          const c = col + dc;
          if (isInBounds(r, c) && (board[r][c] === null || board[r][c]?.color !== color)) {
            moves.push({ row: r, col: c, capture: board[r][c] !== null });
          }
        }
        break;
      }
    }
    return moves;
  };

  const isKingInCheck = (brd: Cell[][], color: Color): boolean => {
    let kingPos: { row: number; col: number } | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (brd[r][c]?.piece === "king" && brd[r][c]?.color === color) {
          kingPos = { row: r, col: c };
        }
      }
    }
    if (!kingPos) return false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = brd[r][c];
        if (piece && piece.color !== color) {
          const moves = getPossibleMoves(r, c, piece);
          if (moves.some(m => m.row === kingPos!.row && m.col === kingPos!.col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isCheckmate = (brd: Cell[][], color: Color): boolean => {
    if (!isKingInCheck(brd, color)) return false;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = brd[r][c];
        if (piece && piece.color === color) {
          const moves = getPossibleMoves(r, c, piece);
          for (let move of moves) {
            const copy = brd.map(row => row.slice());
            copy[move.row][move.col] = copy[r][c];
            copy[r][c] = null;
            if (!isKingInCheck(copy, color)) return false;
          }
        }
      }
    }
    return true;
  };

  const handleCellClick = (row: number, col: number) => {
    if (winner) return;
    const clicked = board[row][col];
    const move = possibleMoves.find(m => m.row === row && m.col === col);

    if (move && activeCell) {
      const newBoard = board.map(r => r.slice());
      newBoard[row][col] = board[activeCell.row][activeCell.col];
      newBoard[activeCell.row][activeCell.col] = null;
      const nextTurn = turn === "white" ? "black" : "white";

      setBoard(newBoard);
      setActiveCell(null);
      setPossibleMoves([]);
      setTurn(nextTurn);

      const kingAlive = newBoard.some(row =>
        row.some(cell => cell?.piece === "king" && cell.color === nextTurn)
      );

      if (!kingAlive) {
        setStatusMessage(`${nextTurn === "white" ? "Білі" : "Чорні"} програли (короля побито — мат)`);
        setWinner(turn);
        return;
      }

      if (isKingInCheck(newBoard, nextTurn)) {
        setCheck(nextTurn);
        if (pendingCheck) {
          setStatusMessage(`${nextTurn === "white" ? "Білі" : "Чорні"} програли (мат)`);
          setWinner(turn);
          setPendingCheck(false);
          return;
        } else {
          setStatusMessage("Шах!");
          setPendingCheck(true);
        }

        if (isCheckmate(newBoard, nextTurn)) {
          setStatusMessage(`${nextTurn === "white" ? "Білі" : "Чорні"} програли (мат)`);
          setWinner(turn);
          setPendingCheck(false);
          return;
        }
      } else {
        setCheck(null);
        setPendingCheck(false);
        setStatusMessage(null);
      }

      return;
    }

    if (clicked && clicked.color === turn) {
      setActiveCell({ row, col });
      setPossibleMoves(getPossibleMoves(row, col, clicked));
    } else {
      setActiveCell(null);
      setPossibleMoves([]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] p-2 sm:p-4">
      <div className="bg-[#93C572] p-3 sm:p-6 rounded-xl shadow-lg w-full max-w-[90vw] sm:max-w-[28rem] mx-auto">
        <h1 className="text-lg sm:text-2xl font-bold text-center mb-2">
          {winner
            ? statusMessage || `Гру закінчено — перемогли ${winner === "white" ? "Білі" : "Чорні"}`
            : statusMessage || `Шахи — черга: ${turn === "white" ? "Білі" : "Чорні"}`}
        </h1>
        <div className="grid grid-cols-8 gap-0 border-2 border-gray-700 mx-auto w-full">
          {board.map((rowArr, rowIndex) =>
            rowArr.map((cell, colIndex) => {
              const isDark = (rowIndex + colIndex) % 2 === 1;
              const isActive = activeCell?.row === rowIndex && activeCell?.col === colIndex;
              const move = possibleMoves.find(m => m.row === rowIndex && m.col === colIndex);
              const isPossibleMove = !!move;
              const isCapture = move?.capture;
              const isKingChecked =
                cell?.piece === "king" && check === cell.color && isKingInCheck(board, cell.color);

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    aspect-square box-border flex items-center justify-center relative
                    ${isDark ? "bg-[#b58863]" : "bg-[#f0d9b5]"}
                    ${isKingChecked ? "bg-red-200" : ""}
                    ${cell && isActive ? "ring-4 ring-yellow-400 outline-none" : "outline outline-1 outline-gray-400"}
                    cursor-pointer`}
                >
                  {/* адаптивний розмір фігур */}
                  {cell ? (
                    <img
                      src={icons[cell.color][cell.piece]}
                      alt={`${cell.color}-${cell.piece}`}
                      className="w-[70%] h-[70%] sm:w-10 sm:h-10"
                    />
                  ) : null}
                  {isPossibleMove && !isCapture && (
                    <div className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-700"></div>
                  )}
                  {isPossibleMove && isCapture && (
                    <div className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 border-1 border-white"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
