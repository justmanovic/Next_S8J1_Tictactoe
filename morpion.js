class Morpion {
    humanPlayer = "J1";
    iaPlayer = "J2";
    iaLevel = 2;
    turn = 0;
    gameOver = false;

    gridMap = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];

    coordinates = [
        [
            [0, 0],
            [0, 1],
            [0, 2],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 2],
        ],
        [
            [2, 0],
            [2, 1],
            [2, 2],
        ],
    ];

    constructor(firstPlayer = "J1") {
        this.humanPlayer = firstPlayer;
        this.iaPlayer = firstPlayer === "J1" ? "J2" : "J1";
        this.initGame();
    }

    initGame = () => {
        this.gridMap.forEach((line, y) => {
            line.forEach((cell, x) => {
                this.getCell(x, y).onclick = () => {
                    this.doPlayHuman(x, y);
                };
            });
        });

        if (this.iaPlayer === "J1") {
            this.doPlayIa();
        }
    };

    getCell = (x, y) => {
        const column = x + 1;
        const lines = ["A", "B", "C"];
        const cellId = `${lines[y]}${column}`;
        return document.getElementById(cellId);
    };

    getBoardWinner = (board) => {
        const isWinningRow = ([a, b, c]) => a !== null && a === b && b === c;

        let winner = null;

        // Horizontal
        board.forEach((line) => {
            if (isWinningRow(line)) {
                winner = line[0];
            }
        });

        // Vertical
        [0, 1, 2].forEach((col) => {
            if (isWinningRow([board[0][col], board[1][col], board[2][col]])) {
                winner = board[0][col];
            }
        });

        if (winner) {
            return winner;
        }

        // Diagonal
        const diagonal1 = [board[0][0], board[1][1], board[2][2]];
        const diagonal2 = [board[0][2], board[1][1], board[2][0]];
        if (isWinningRow(diagonal1) || isWinningRow(diagonal2)) {
            return board[1][1];
        }

        const isFull = board.every((line) =>
            line.every((cell) => cell !== null)
        );
        return isFull ? "tie" : null;
    };

    checkWinner = (lastPlayer) => {
        const winner = this.getBoardWinner(this.gridMap);
        if (!winner) {
            return;
        }

        this.gameOver = true;
        switch (winner) {
            case "tie":
                this.displayEndMessage("Vous êtes à égalité !");
                break;
            case this.iaPlayer:
                this.displayEndMessage("L'IA a gagné !");
                break;
            case this.humanPlayer:
                this.displayEndMessage("Tu as battu l'IA !");
                break;
        }
    };

    displayEndMessage = (message) => {
        const endMessageElement = document.getElementById("end-message");
        endMessageElement.textContent = message;
        endMessageElement.style.display = "block";
    };

    drawHit = (x, y, player) => {
        if (this.gridMap[y][x] !== null) {
            return false;
        }

        this.gridMap[y][x] = player;
        this.turn += 1;
        this.getCell(x, y).classList.add(`filled-${player}`);
        this.checkWinner(player);
        return true;
    };

    doPlayHuman = (x, y) => {
        if (this.gameOver) {
            return;
        }

        // Peut-on utiliser un objet de fonctions plutôt que des if ?
        if (this.drawHit(x, y, this.humanPlayer)) {
            if (this.iaLevel == 1) {
                this.doPlayIa1();
            } else if (this.iaLevel == 2) {
                this.doPlayIa2(this.gridMap);
            } else if (this.iaLevel == 3) {
                this.doPlayIa3();
            }
        }
    };

    doPlayIa1 = () => {
        let startTurn = this.turn;
        while (startTurn === this.turn) {
            let x = Math.floor(Math.random() * 3);
            let y = Math.floor(Math.random() * 3);
            this.drawHit(x, y, this.iaPlayer);
        }
    };

    doPlayIa2 = (board) => {
        let startTurn = this.turn;

        const isMissingOne = (row) => {
            return (
                row.filter((cell) => board[cell[0]][cell[1]] == this.iaPlayer)
                    .length == 2 &&
                row.filter((cell) => board[cell[0]][cell[1]] == null).length ==
                    1
            );
        };

        const findMissingOne = (row) => {
            if (startTurn === this.turn)
                return row.find((cell) => board[cell[0]][cell[1]] == null);
        };

        const finishTheJob = (row) => {
            if (isMissingOne(row)) {
                let emptyCell = findMissingOne(row);
                this.drawHit(emptyCell[1], emptyCell[0], this.iaPlayer);
            }
        };

        // l'IA joue en ligne
        this.coordinates.forEach((line) => finishTheJob(line));

        // l'IA joue en colonne
        [0, 1, 2].forEach((y) => {
            let col = [
                [0, y],
                [1, y],
                [2, y],
            ];
            finishTheJob(col);
        });

        // l'IA joue en diagonale
        let diagonals = [
            [
                [0, 0],
                [1, 1],
                [2, 2],
            ],
            [
                [0, 2],
                [1, 1],
                [2, 0],
            ],
        ];

        diagonals.forEach((diag) => finishTheJob(diag));

        if (startTurn === this.turn) {
            [0, 1, 2].forEach((y) => {
                let col = [
                    [0, y],
                    [1, y],
                    [2, y],
                ];
                finishTheJob(col);
            });
        }

        while (startTurn === this.turn) {
            let x = Math.floor(Math.random() * 3);
            let y = Math.floor(Math.random() * 3);
            this.drawHit(x, y, this.iaPlayer);
        }
    };

    doPlayIa3 = () => {
        if (this.gameOver) {
            return;
        }

        const { x, y } = this.minmax(
            this.gridMap,
            0,
            -Infinity,
            Infinity,
            true
        );
        this.drawHit(x, y, this.iaPlayer);
    };

    minmax = (board, depth, alpha, beta, isMaximizing) => {
        // Return a score when there is a winner
        const winner = this.getBoardWinner(board);
        if (winner === this.iaPlayer) {
            return 10 - depth;
        }
        if (winner === this.humanPlayer) {
            return depth - 10;
        }
        if (winner === "tie" && this.turn === 9) {
            return 0;
        }

        const getSimulatedScore = (x, y, player) => {
            board[y][x] = player;
            this.turn += 1;

            const score = this.minmax(
                board,
                depth + 1,
                alpha,
                beta,
                player === this.humanPlayer
            );

            board[y][x] = null;
            this.turn -= 1;

            return score;
        };

        // This tree is going to test every move still possible in game
        // and suppose that the 2 players will always play there best move.
        // The IA search for its best move by testing every combinations,
        // and affects score to every node of the tree.
        if (isMaximizing) {
            // The higher is the score, the better is the move for the IA.
            let bestIaScore = -Infinity;
            let optimalMove;
            for (const y of [0, 1, 2]) {
                for (const x of [0, 1, 2]) {
                    if (board[y][x]) {
                        continue;
                    }

                    const score = getSimulatedScore(x, y, this.iaPlayer);
                    if (score > bestIaScore) {
                        bestIaScore = score;
                        optimalMove = { x, y };
                    }

                    // clear useless branch of the algorithm tree
                    // (optional but recommended)
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }

            return depth === 0 ? optimalMove : bestIaScore;
        }

        // The lower is the score, the better is the move for the player.
        let bestHumanScore = Infinity;
        for (const y of [0, 1, 2]) {
            for (const x of [0, 1, 2]) {
                if (board[y][x]) {
                    continue;
                }

                const score = getSimulatedScore(x, y, this.humanPlayer);
                bestHumanScore = Math.min(bestHumanScore, score);

                // clear useless branch of the algorithm tree
                // (optional but recommended)
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break;
                }
            }
        }
        return bestHumanScore;
    };
}
