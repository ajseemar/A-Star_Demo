var c, cc;

var KEYS = {
    SPACE: "SPACE",
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

const index = (i, j, rows) => i + (j * rows);

const clamp = (num, min, max) => {
    return Math.max(min, Math.min(num, max))
}

const heuristic = (a, b) => {
    const dx = b.position.x - a.position.x;
    const dy = b.position.y - a.position.y;
    return Math.sqrt(dx * dx + dy * dy);
    // return Math.abs(dx) + Math.abs(dy);
};

document.addEventListener("DOMContentLoaded", () => {
    c = document.getElementById('canvas');
    cc = c.getContext('2d');

    const MazeSolverDemo = new Game(c.width, c.height, 50);

    const startDemo = () => {
        let time = Date.now();
        let dt = (MazeSolverDemo.initialTime - time) / 1000.0;

        MazeSolverDemo.update(dt);
        MazeSolverDemo.render();

        MazeSolverDemo.initialTime = time;
        requestAnimationFrame(startDemo);
    }

    startDemo();
});

class Game {
    constructor(vpWidth, vpHeight, cellCount) {
        this.cellSize = vpWidth / cellCount; // renders entire map
        // console.log(this.cellSize);
        // this.cellSize = 25; // for camera
        this.width = cellCount * this.cellSize;
        this.height = cellCount * this.cellSize;

        this.maze = new Maze(cellCount, vpWidth, vpHeight, this.cellSize);
        this.mazeSolver = new aStar(this.maze.grid);

        // this.camera.follow(this.player);

        this.initialTime = Date.now();
    }



    update(dt) {
        this.mazeSolver.update();
        // this.player.update(dt);
        // this.viewport.update(this.player.position.x, this.player.position.y);
        // this.camera.update();
    }

    render() {
        // cc.clearRect(0, 0, c.width, c.height);
        cc.fillStyle = '#000';
        cc.fillRect(0, 0, c.width, c.height);
        this.maze.render();
        this.mazeSolver.render();
        // cc.fillStyle = "#000";
        // cc.fillRect(0, 0, c.width, c.height);
        // this.viewport.render(this.map.grid);
        // this.camera.render(this.map.grid);
        // this.player.render(this.viewport.offset.x, this.viewport.offset.y);
    }
}

// A Star

class MinHeap {
    constructor() {
        this.array = [null];
    }

    empty() {
        if (this.array.length === 1) {
            debugger
            return true;
        } else {
            return false;
        }
    }

    getParent(idx) {
        return Math.floor(idx / 2);
    }

    getLeftChild(idx) {
        return idx * 2;
    }

    getRightChild(idx) {
        return idx * 2 + 1;
    }

    insert(node) {
        // add the new node to the bottom level, far-left 
        this.array.push(node);

        // then, sift that value up the heap to restore heap property
        this.siftUp(this.array.length - 1);
    }

    siftUp(idx) {
        // if the node is already at the root, there's no further we can sift up
        if (idx === 1) return;

        let parentIdx = this.getParent(idx);

        // if the node is bigger than it's parent, we are breaking heap property...
        if (this.array[parentIdx].node.f > this.array[idx].node.f) {
            // so swap the node with it's parent
            // [this.array[parentIdx], this.array[idx]] = [this.array[idx], this.array[parentIdx]];
            let temp = this.array[parentIdx];
            this.array[parentIdx] = this.array[idx];
            this.array[idx] = temp;

            // and continue to sift it up recursively
            this.siftUp(parentIdx);
        }
    }

    deleteMin() {
        // recall that we have an empty position at the very front of the array, 
        // so an array length of 2 means there is only 1 item in the heap

        // if there is only 1 element in the heap, simply remove it
        // debugger
        if (this.array.length === 2) return this.array.pop();

        // if there are no elements in the heap, do nothing
        if (this.array.length === 1) return null;

        // otherwise remove the last element and make it the root at the front of the array
        let min = this.array[1];
        this.array[1] = this.array.pop();

        // then, sift the new root down to restore heap property
        this.siftDown(1);
        return min;
    }

    siftDown(idx) {
        let ary = this.array;
        let leftIdx = this.getLeftChild(idx);
        let rightIdx = this.getRightChild(idx);
        let leftVal = ary[leftIdx];
        let rightVal = ary[rightIdx];

        // if the node is missing children, consider the missing children as the value -Infinity
        // this allows the node to keep heap property, since any value is greater than -Infinity
        // this will also give us children values to compare later, undefined should not be used for comparison**
        if (!leftVal) {
            leftVal = {
                node: {
                    f: Infinity
                }
            };
        }
        if (!rightVal) {
            rightVal = {
                node: {
                    f: Infinity
                }
            };
        }
        // if (leftVal.node.f === undefined) leftVal.node.f = Infinity;
        // if (rightVal.node.f === undefined) rightVal.node.f = Infinity;

        // if the node is bigger than both children, we have restored heap property, so exit
        if (ary[idx].node.f < leftVal.node.f && ary[idx].node.f < rightVal.node.f) return;

        // otherwise the node is smaller than one of it's children,
        // so swap this node with the bigger between the two children**
        if (leftVal.node.f < rightVal.node.f) {
            var swapIdx = leftIdx;
        } else {
            var swapIdx = rightIdx;
        }
        let temp = ary[idx];
        ary[idx] = ary[swapIdx];
        ary[swapIdx] = temp;
        // [ary[idx], ary[swapIdx]] = [ary[swapIdx], ary[idx]];

        // and continue to sift it down recursively
        this.siftDown(swapIdx);
    }

    includes(cell, idx = 1) {
        return this.array.includes(cell);
        // if (this.array.length === 1) return false;
        // if (this.array[idx] === cell) return true;
        // let leftIdx = this.getLeftChild(idx);
        // let rightIdx = this.getRightChild(idx);
        // let leftVal = this.array[leftIdx];
        // let rightVal = this.array[rightIdx];
        // if (this.array[idx] === leftVal) return true;
        // if (this.array[idx] === rightVal) return true;

        // if (!leftVal || leftVal.node.f > cell.node.f) return false;
        // if (!rightVal || rightVal.node.f > cell.node.f) return false;

        // if (this.includes(cell, leftIdx)) return true;
        // else if (this.includes(cell, rightIdx)) return true;
        // else return false;
    }

    clean() {
        this.array = [null];
    }
}

class aStar {
    constructor(grid) {
        this.nodes = grid.cells.map(cell => cell.node);
        this.grid = grid;
        this.cells = grid.cells;
        this.start = this.cells[0];
        this.end = this.cells[this.cells.length - 1];
        // console.log(this.start, this.end);

        this.openSet = [this.start];
        this.closedSet = [];
        this.path = [];

        // for optimized algo

        // this.start = this.nodes[0];
        // this.end = this.nodes[this.nodes.length - 1];
        this.openHeap = new MinHeap();
        this.openHeap.insert(this.start);
        this.initialTime = Date.now();
    }

    update() {
        if (!this.openHeap.empty()) {
            // let winner = 0;
            // this.openSet.forEach((cell, idx) => {
            //     // debugger
            //     if (cell.node.f < this.openSet[winner].node.f) winner = idx;
            //     // debugger
            // });

            const current = this.openHeap.deleteMin();
            // this.path = [];
            // let temp = current.node;
            // this.path.push(temp);
            // while (temp.parent) {
            //     this.path.push(temp.parent);
            //     temp = temp.parent;
            // }
            if (current === this.end) {
                console.log(`${(Date.now() - this.initialTime) / 1000.0} seconds`)
                console.log('DONE');
                this.path = [];
                let temp = current.node;
                this.path.push(temp);
                while (temp.parent) {
                    this.path.push(temp.parent);
                    temp = temp.parent;
                }
                this.finished = true;
                return;
            }
            // if (!current) debugger;
            // remove current from open set
            // for (let i = this.openSet.length - 1; i >= 0; i--) {
            //     if (this.openSet[i] === current) {
            //         this.openSet.splice(i, 1);
            //         break;
            //     }
            // }
            // add current to closed set 
            // debugger
            const neighbors = current.neighbors.filter(obj => !Object.keys(current.walls)
                .includes(Object.keys(obj)[0]))
                .map(obj => Object.values(obj)[0]);
            // debugger
            // console.log(neighbors);
            neighbors.forEach(neighbor => {
                if (!this.closedSet.includes(neighbor)) {
                    const tentativeG = current.node.g + 1;
                    let newPath = false;
                    if (this.openHeap.includes(neighbor) && tentativeG < neighbor.node.g) {
                        neighbor.node.g = tentativeG;
                        newPath = true;
                    } else {
                        neighbor.node.g = tentativeG;
                        this.openHeap.insert(neighbor);
                        newPath = true;
                    }

                    if (newPath) {
                        neighbor.node.h = heuristic(neighbor.node, this.end.node);
                        neighbor.node.f = neighbor.node.g + neighbor.node.h;
                        neighbor.node.parent = current.node;
                    }
                }
            });
            this.closedSet.push(current);
            // debugger
        }
    }

    render() {
        // if (!this.finished) {
        //     this.openSet.forEach(cell => cell.render('#0f0'));
        //     this.closedSet.forEach(cell => cell.render('#f00'));
        // }
        this.path.forEach(node => {
            // node.render();
            cc.strokeStyle = "#0f0";
            cc.beginPath();
            if (node.parent)
                cc.moveTo(node.parent.position.x, node.parent.position.y);
            else
                cc.moveTo(node.position.x, node.position.y);
            cc.lineTo(node.position.x, node.position.y);
            cc.closePath();
            cc.stroke();
        });
        // this.cells.forEach(cell => cell.node.render());
    }
}















// Maze

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Wall {
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2

        this.a = this.p2.y - this.p1.y;
        this.b = this.p1.x - this.p2.x;
        this.c = this.a * this.p1.x + this.b * this.p1.y;
    }

    render() {
        cc.beginPath();
        cc.moveTo(this.p1.x, this.p1.y);
        cc.lineTo(this.p2.x, this.p2.y);
        cc.closePath();
        cc.stroke();
    }
}

class Node {
    constructor(i, j, size) {
        this.position = {
            x: (j * size) + (size / 2),
            y: (i * size) + (size / 2)
        };
        this.neighbors = {
            "north": Infinity,
            "east": Infinity,
            "south": Infinity,
            "west": Infinity
        };
        this.size = size / 15;
        this.f = 0;
        this.g = this.h = 0;
        this.cost = 1;
        this.visited = false;
        this.closed = false;
        this.parent = null
    }

    render(color) {
        cc.beginPath();
        cc.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
        cc.closePath();
        cc.fillStyle = '#f0f';
        cc.fill();


    }
}

class Cell {
    constructor(row, col, size) {
        this.row = row;
        this.col = col;
        this.size = size;
        // console.log(this.size);
        this.visited = false;
        this.neighbors = [];
        this.node = new Node(row, col, size);
        this.walls = {
            "north": new Wall(
                new Point(this.col * this.size, this.row * this.size),
                new Point((this.col * this.size) + this.size, this.row * this.size)
            ),
            "east": new Wall(
                new Point((this.col * this.size) + this.size, this.row * this.size),
                new Point((this.col * this.size) + this.size, (this.row * this.size) + this.size)
            ),
            "south": new Wall(
                new Point((this.col * this.size), (this.row * this.size) + this.size),
                new Point((this.col * this.size) + this.size, (this.row * this.size) + this.size)
            ),
            "west": new Wall(
                new Point(this.col * this.size, this.row * this.size),
                new Point(this.col * this.size, (this.row * this.size) + this.size)
            )
        }
    }

    render(color) {
        if (color) {
            cc.fillStyle = color;
            cc.fillRect(this.col * this.size + this.size / 4, this.row * this.size + this.size / 4, this.size - this.size / 4 * 2, this.size - this.size / 4 * 2);
        } else {

            cc.strokeStyle = "#53A1F3";
            Object.values(this.walls).forEach(({ p1, p2 }) => {
                cc.beginPath();
                cc.moveTo(p1.x, p1.y);
                cc.lineTo(p2.x, p2.y);
                cc.closePath();
                cc.stroke();
            });

        }
        // this.node.render(cc);
    }
}

class Grid {
    constructor(size, w, h, cellSize) {
        this.cc = cc;
        this.cells = new Array(size * size);
        this.size = {
            w: w,
            h: h
        };
        this.cellCount = size;

        this.cellSize = cellSize;

        this.populateGrid();
        this.populateCells();
    }

    populateGrid() {
        for (let j = 0; j < this.cellCount; j++) {
            for (let i = 0; i < this.cellCount; i++) {
                this.cells[index(i, j, this.cellCount)] = new Cell(i, j, this.cellSize);
            }
        }
    }

    populateCells() {
        for (let i = 0; i < this.cells.length; i++)
            Grid.populateCellWithNeighbors(this.cells[i], this.cells, this.cellCount, this.cc);
    }

    static populateCellWithNeighbors(cell, cells, size, cc) {
        if (cells[index(cell.row - 1, cell.col, size)]) {
            if (cell.row - 1 >= 0) {
                cell.neighbors.push({ 'north': cells[index(cell.row - 1, cell.col, size)] });
            }
        }
        if (cells[index(cell.row, cell.col + 1, size)]) {
            cell.neighbors.push({ 'east': cells[index(cell.row, cell.col + 1, size)] });
        }
        if (cells[index(cell.row + 1, cell.col, size)]) {
            if (cell.row + 1 <= size - 1) {
                cell.neighbors.push({ 'south': cells[index(cell.row + 1, cell.col, size)] });
            }
        }
        if (cells[index(cell.row, cell.col - 1, size)]) {
            cell.neighbors.push({ 'west': cells[index(cell.row, cell.col - 1, size)] });
        }

        cell.neighbors.forEach(cellN => {
            cc.fillStyle = "#9A66AC";
            cc.fillRect(cellN.row * cellN.size, cellN.col * cellN.size, cellN.size, cellN.size);
        });
    }

    render() {
        for (let j = 0; j < this.cellCount; j++) {
            for (let i = 0; i < this.cellCount; i++) {
                let cell = this.cells[index(j, i, this.cellCount)];
                cell.render();
            }
        }
    }
}
class Maze {
    constructor(size, width, height, cellSize) {
        this.cellCount = size;
        this.width = width;
        this.height = height;
        this.grid = new Grid(this.cellCount, this.width, this.height, cellSize);

        this.generateMaze();
    }


    generateMaze() {
        let currentCell = this.grid.cells[0];
        currentCell.visited = true;
        const stack = [currentCell];

        while (stack.length !== 0) {
            let neighbors = currentCell.neighbors.filter(obj => {
                let cell = Object.values(obj)[0];
                if (!cell) return null;
                return !cell.visited;
            });

            let neighborDir;
            let neighbor;

            let neighborObj = neighbors[Math.floor(Math.random() * neighbors.length)];
            if (neighborObj) {
                neighborDir = Object.keys(neighborObj)[0];
                neighbor = neighborObj[neighborDir];
            }

            if (neighborObj === undefined) {
                currentCell = stack.pop();
            }
            else {
                neighbor.visited = true;
                switch (neighborDir) {
                    case "north":
                        delete currentCell.walls["north"];
                        delete neighbor.walls["south"];
                        currentCell.node.neighbors["north"] = 1;
                        neighbor.node.neighbors["south"] = 1;
                        break;
                    case "east":
                        delete currentCell.walls["east"];
                        delete neighbor.walls["west"];
                        currentCell.node.neighbors["east"] = 1;
                        neighbor.node.neighbors["west"] = 1;
                        break;
                    case "south":
                        delete currentCell.walls["south"];
                        delete neighbor.walls["north"];
                        currentCell.node.neighbors["south"] = 1;
                        neighbor.node.neighbors["north"] = 1;
                        break;
                    case "west":
                        delete currentCell.walls["west"];
                        delete neighbor.walls["east"];
                        currentCell.node.neighbors["west"] = 1;
                        neighbor.node.neighbors["east"] = 1;
                        break;
                }
                stack.push(neighbor);
                currentCell = neighbor;
            }
        }
    }

    render() {
        this.grid.render();
    }
}

// A Star + Maze
class Heap {
    push(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    }

    pop() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    }

    remove(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    }

    size() {
        return this.content.length;
    }

    rescoreElement(node) {
        this.sinkDown(this.content.indexOf(node));
    }

    sinkDown(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1;
            var parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    }

    bubbleUp(n) {
        // Look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1;
            var child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null;
            var child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};