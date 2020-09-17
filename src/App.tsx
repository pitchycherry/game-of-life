import React, {useCallback, useRef, useState} from 'react';
import './App.css';
import produce from "immer";

const numRows = 25;
const numCols = 25;
const operations = [
    [0, 1],
    [0, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, 0],
    [-1, 0]
];

const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => 0));
    }

    return rows;
};

const generateRandomGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => Math.random() > .5 ? 1 : 0));
    }

    return rows;
};

const App: React.FC = () => {
    const [grid, setGrid] = useState(() => {
        return generateEmptyGrid();
    });

    const [running, setRunning] = useState(false);

    const runningRef = useRef(running);
    runningRef.current = running;

    const runSimulation = useCallback(() => {
        if (!runningRef.current) {
            return;
        }

        setGrid(g => {
            return produce(g, gridCopy => {
                for (let i = 0; i < numRows; i++) {
                    for (let k = 0; k < numCols; k++) {
                        let neighbors = 0;
                        operations.forEach(([x, y]) => {
                            const newI = i + x;
                            const newK = k + y;
                            if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
                                neighbors += g[newI][newK];
                            }
                        });

                        if (neighbors < 2 || neighbors > 3) {
                            gridCopy[i][k] = 0;
                        } else if (g[i][k] === 0 && neighbors === 3) {
                            gridCopy[i][k] = 1;
                        }
                    }
                }
            });
        });

        // simulate
        setTimeout(runSimulation, 100)
    }, []);

    const handleCellClick = (x: number, y: number) => {
        const newGrid = produce(grid, gridCopy => {
            gridCopy[x][y] = gridCopy[x][y] ? 0 : 1;
        });
        setGrid(newGrid);
    }

    const handleRunSimulationClick = () => {
        setRunning(!running);
        if (!running) {
            runningRef.current = true;
            runSimulation();
        }
    }

    return <div className="main-frame">
        <div className="grid" style={{gridTemplateColumns: `repeat(${numCols}, 20px)`}}>
            {grid.map((rows, x) => rows.map((col, y) =>
                <div key={`${x}-${y}`}
                     onClick={() => handleCellClick(x, y)}
                     className={`cell ${grid[x][y] && 'bg__green'}`}/>))}
        </div>
        <div className="manage-panel">
            <button onClick={() => handleRunSimulationClick()}> {running ? 'Stop' : 'Start'}</button>
            <button onClick={() => setGrid(generateEmptyGrid())}>Clear</button>
            <button onClick={() => setGrid(generateRandomGrid())}>Random</button>
        </div>
    </div>
}

export default App;
