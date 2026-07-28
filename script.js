/**
 * DSA Visualizer — Main Application Script
 * Modular vanilla JavaScript for algorithm visualizations
 * (Optimized, bug-free, zero-dependency)
 */

/* ============================================
   MODULE: Animation Engine
   Handles async step-by-step frame animations
   ============================================ */
const AnimationEngine = (() => {
  let speed = 5;
  let paused = false;
  let running = false;
  let pauseResolve = null;

  const getDelay = () => Math.max(50, 600 - speed * 55);

  return {
    get speed() { return speed; },
    set speed(v) { speed = v; },
    get running() { return running; },
    get paused() { return paused; },

    async wait() {
      if (paused) {
        await new Promise(resolve => { pauseResolve = resolve; });
      }
      await new Promise(r => setTimeout(r, getDelay()));
    },

    pause() {
      paused = true;
    },

    resume() {
      paused = false;
      if (pauseResolve) {
        pauseResolve();
        pauseResolve = null;
      }
    },

    start() { running = true; },
    stop() {
      running = false;
      paused = false;
      if (pauseResolve) {
        pauseResolve();
        pauseResolve = null;
      }
    }
  };
})();

/* ============================================
   MODULE: Algorithm Metadata
   Descriptions, complexity, and config
   ============================================ */
const ALGO_META = {
  'array-create': {
    title: 'Create Array',
    description: 'Initialize an array with random or custom values and visualize elements as indexed cells.',
    time: 'O(n)',
    space: 'O(n)',
    category: 'array'
  },
  'array-insert': {
    title: 'Insert Element',
    description: 'Insert a value at a specific index, shifting subsequent elements to the right.',
    time: 'O(n)',
    space: 'O(1)',
    category: 'array'
  },
  'array-delete': {
    title: 'Delete Element',
    description: 'Remove an element at a given index, shifting remaining elements to the left.',
    time: 'O(n)',
    space: 'O(1)',
    category: 'array'
  },
  'linear-search': {
    title: 'Linear Search',
    description: 'Sequentially scan each element until the target value is found or the array ends.',
    time: 'O(n)',
    space: 'O(1)',
    category: 'search'
  },
  'binary-search': {
    title: 'Binary Search',
    description: 'Repeatedly divide a sorted array in half to locate a target value efficiently.',
    time: 'O(log n)',
    space: 'O(1)',
    category: 'search'
  },
  'bubble-sort': {
    title: 'Bubble Sort',
    description: 'Repeatedly swap adjacent elements if they are in the wrong order, bubbling the largest to the end.',
    time: 'O(n²)',
    space: 'O(1)',
    category: 'sort'
  },
  'selection-sort': {
    title: 'Selection Sort',
    description: 'Find the minimum element and place it at the beginning, repeating for the unsorted portion.',
    time: 'O(n²)',
    space: 'O(1)',
    category: 'sort'
  },
  'insertion-sort': {
    title: 'Insertion Sort',
    description: 'Build a sorted array one element at a time by inserting each into its correct position.',
    time: 'O(n²)',
    space: 'O(1)',
    category: 'sort'
  },
  'merge-sort': {
    title: 'Merge Sort',
    description: 'Divide the array in half, sort each half recursively, then merge the sorted halves.',
    time: 'O(n log n)',
    space: 'O(n)',
    category: 'sort'
  },
  'quick-sort': {
    title: 'Quick Sort',
    description: 'Pick a pivot, partition elements smaller/larger than pivot, then recursively sort partitions.',
    time: 'O(n log n) avg',
    space: 'O(log n)',
    category: 'sort'
  },
  stack: {
    title: 'Stack',
    description: 'LIFO data structure — push adds to top, pop removes from top, peek views the top element.',
    time: 'O(1) per op',
    space: 'O(n)',
    category: 'ds'
  },
  queue: {
    title: 'Queue',
    description: 'FIFO data structure — enqueue adds to rear, dequeue removes from front.',
    time: 'O(1) per op',
    space: 'O(n)',
    category: 'ds'
  },
  'linked-list': {
    title: 'Singly Linked List',
    description: 'Linear collection of nodes where each node contains data and a pointer (next) to the next node.',
    time: 'O(n) search',
    space: 'O(n)',
    category: 'ds'
  }
};

/* ============================================
   MODULE: DOM Helpers & Renderers
   ============================================ */
const DOM = {
  $(id) { return document.getElementById(id); },

  setStep(text) {
    DOM.$('step-explanation').textContent = text;
  },

  setStats(comparisons, swaps) {
    DOM.$('stat-comparisons').textContent = comparisons;
    DOM.$('stat-swaps').textContent = swaps;
  },

  getCanvas() { return DOM.$('viz-canvas'); },

  clearCanvas() {
    DOM.getCanvas().innerHTML = '';
  },

  /** Render bar chart for sorting/search */
  renderBars(arr, highlights = {}) {
    const { compare = [], swap = [], sorted = [], active = [], pivot = [], found = [], pointers = {} } = highlights;
    const container = document.createElement('div');
    container.className = 'bar-container';

    const maxVal = Math.max(...arr, 1);

    arr.forEach((val, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'bar-wrapper';

      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${(val / maxVal) * 240}px`;
      if (compare.includes(i)) bar.classList.add('compare');
      if (swap.includes(i)) bar.classList.add('swap');
      if (sorted.includes(i)) bar.classList.add('sorted');
      if (active.includes(i)) bar.classList.add('active');
      if (pivot.includes(i)) bar.classList.add('pivot');
      if (found.includes(i)) bar.classList.add('found');

      const value = document.createElement('span');
      value.className = 'bar-value';
      value.textContent = val;

      const index = document.createElement('span');
      index.className = 'bar-index';
      index.textContent = i;

      wrapper.appendChild(bar);
      wrapper.appendChild(value);
      wrapper.appendChild(index);

      if (pointers[i]) {
        const ptr = document.createElement('span');
        ptr.className = 'pointer-label';
        ptr.textContent = pointers[i];
        wrapper.appendChild(ptr);
      }

      container.appendChild(wrapper);
    });

    DOM.clearCanvas();
    DOM.getCanvas().appendChild(container);
  },

  /** Render cell-based array */
  renderCells(arr, highlights = {}) {
    const { active = [], compare = [], found = [], insert = [], del = [] } = highlights;
    const container = document.createElement('div');
    container.className = 'cell-container';

    arr.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = val;
      if (active.includes(i)) cell.classList.add('active');
      if (compare.includes(i)) cell.classList.add('compare');
      if (found.includes(i)) cell.classList.add('found');
      if (insert.includes(i)) cell.classList.add('insert');
      if (del.includes(i)) cell.classList.add('delete');
      container.appendChild(cell);
    });

    DOM.clearCanvas();
    DOM.getCanvas().appendChild(container);
  },

  /** Render stack */
  renderStack(stack, topIndex = -1) {
    const container = document.createElement('div');
    container.className = 'stack-container';

    stack.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'stack-item' + (i === topIndex ? ' top' : '');
      item.textContent = val;
      container.appendChild(item);
    });

    const label = document.createElement('div');
    label.className = 'stack-label';
    label.textContent = stack.length === 0 ? 'Stack (empty)' : '↑ TOP';
    container.appendChild(label);

    DOM.clearCanvas();
    DOM.getCanvas().appendChild(container);
  },

  /** Render queue */
  renderQueue(queue, frontIdx = 0, rearIdx = -1) {
    const container = document.createElement('div');
    const wrapper = document.createElement('div');
    wrapper.style.textAlign = 'center';

    const qContainer = document.createElement('div');
    qContainer.className = 'queue-container';

    if (queue.length === 0) {
      qContainer.innerHTML = '<span class="viz-empty">Queue is empty</span>';
    } else {
      queue.forEach((val, i) => {
        const item = document.createElement('div');
        item.className = 'queue-item';
        if (i === frontIdx) item.classList.add('front');
        if (i === rearIdx || i === queue.length - 1) item.classList.add('rear');
        item.textContent = val;
        qContainer.appendChild(item);

        if (i < queue.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'queue-arrow';
          arrow.textContent = '→';
          qContainer.appendChild(arrow);
        }
      });
    }

    wrapper.appendChild(qContainer);

    if (queue.length > 0) {
      const labels = document.createElement('div');
      labels.className = 'queue-labels';
      labels.innerHTML = '<span>FRONT</span><span>REAR</span>';
      wrapper.appendChild(labels);
    }

    container.appendChild(wrapper);
    DOM.clearCanvas();
    DOM.getCanvas().appendChild(container);
  },

  /** Render Linked List */
  renderLinkedList(nodes, highlights = {}) {
    const { active = [], insert = [], del = [] } = highlights;
    const container = document.createElement('div');
    container.className = 'll-container';

    if (!nodes || nodes.length === 0) {
      container.innerHTML = '<span class="viz-empty">Linked List is empty</span>';
    } else {
      nodes.forEach((val, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'll-node-wrapper';

        if (i === 0) {
          const headTag = document.createElement('span');
          headTag.className = 'll-head-tag';
          headTag.textContent = 'HEAD';
          wrapper.appendChild(headTag);
        }

        const node = document.createElement('div');
        node.className = 'll-node';
        if (active.includes(i)) node.classList.add('active');
        if (insert.includes(i)) node.classList.add('insert');
        if (del.includes(i)) node.classList.add('delete');

        const dataDiv = document.createElement('div');
        dataDiv.className = 'll-data';
        dataDiv.textContent = val;

        const nextDiv = document.createElement('div');
        nextDiv.className = 'll-next';
        nextDiv.textContent = 'next •';

        node.appendChild(dataDiv);
        node.appendChild(nextDiv);
        wrapper.appendChild(node);
        container.appendChild(wrapper);

        if (i < nodes.length - 1) {
          const arrowWrap = document.createElement('div');
          arrowWrap.className = 'll-arrow-wrap';
          arrowWrap.innerHTML = `
            <svg class="ll-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          `;
          container.appendChild(arrowWrap);
        }
      });

      const nullWrap = document.createElement('div');
      nullWrap.className = 'll-arrow-wrap';
      nullWrap.innerHTML = `
        <svg class="ll-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
      container.appendChild(nullWrap);

      const nullBadge = document.createElement('div');
      nullBadge.className = 'll-null-badge';
      nullBadge.textContent = 'NULL';
      container.appendChild(nullBadge);
    }

    DOM.clearCanvas();
    DOM.getCanvas().appendChild(container);
  }
};

/* ============================================
   MODULE: Input Controls Builder
   ============================================ */
const InputBuilder = {
  container: null,

  init() {
    this.container = DOM.$('input-controls');
  },

  clear() {
    this.container.innerHTML = '';
  },

  addGroup(label, inputEl) {
    const group = document.createElement('div');
    group.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = label;
    group.appendChild(lbl);
    group.appendChild(inputEl);
    this.container.appendChild(group);
    return inputEl;
  },

  textInput(label, placeholder, value = '') {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.value = value;
    return this.addGroup(label, input);
  },

  numberInput(label, placeholder, value = 0, min, max) {
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = placeholder;
    input.value = value;
    if (min !== undefined) input.min = min;
    if (max !== undefined) input.max = max;
    return this.addGroup(label, input);
  },

  select(label, options) {
    const select = document.createElement('select');
    options.forEach(([val, text]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = text;
      select.appendChild(opt);
    });
    return this.addGroup(label, select);
  },

  button(text, onClick, primary = false) {
    const btn = document.createElement('button');
    btn.className = primary ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm';
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    this.container.appendChild(btn);
    return btn;
  }
};

/* ============================================
   MODULE: Algorithm Implementations
   ============================================ */
const Algorithms = {
  state: {},

  resetStats() {
    DOM.setStats(0, 0);
    this.stats = { comparisons: 0, swaps: 0 };
  },

  stats: { comparisons: 0, swaps: 0 },

  incCompare() {
    this.stats.comparisons++;
    DOM.setStats(this.stats.comparisons, this.stats.swaps);
  },

  incSwap() {
    this.stats.swaps++;
    DOM.setStats(this.stats.comparisons, this.stats.swaps);
  },

  /* --- Array: Create --- */
  initArrayCreate() {
    this.state.array = [12, 45, 23, 67, 34, 89, 56, 11, 78, 32];
    DOM.renderCells(this.state.array);
    DOM.setStep('Array created with 10 elements. Modify values or click Run to animate creation.');

    InputBuilder.clear();
    InputBuilder.textInput('Values (comma-separated)', '12,45,23,...', this.state.array.join(','));
    InputBuilder.numberInput('Size', '10', 10, 1, 20);
    InputBuilder.button('Generate Random', () => {
      const sizeInput = InputBuilder.container.querySelector('input[type="number"]');
      const size = sizeInput ? parseInt(sizeInput.value) || 10 : 10;
      this.state.array = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
      const textInput = InputBuilder.container.querySelector('input[type="text"]');
      if (textInput) textInput.value = this.state.array.join(',');
      DOM.renderCells(this.state.array);
      DOM.setStep(`Generated random array of size ${size}.`);
    }, true);
  },

  async runArrayCreate() {
    AnimationEngine.start();
    this.resetStats();
    const textInput = InputBuilder.container.querySelector('input[type="text"]');
    const input = textInput ? textInput.value : '';
    const values = input.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    this.state.array = [];

    for (let i = 0; i < values.length; i++) {
      if (!AnimationEngine.running) break;
      this.state.array.push(values[i]);
      DOM.renderCells(this.state.array, { insert: [i] });
      DOM.setStep(`Inserting value ${values[i]} at index ${i}.`);
      await AnimationEngine.wait();
    }

    DOM.renderCells(this.state.array);
    DOM.setStep(`Array created with ${this.state.array.length} elements.`);
    AnimationEngine.stop();
  },

  /* --- Array: Insert --- */
  initArrayInsert() {
    this.state.array = [10, 20, 30, 40, 50];
    DOM.renderCells(this.state.array);
    DOM.setStep('Enter a value and index, then click Run to insert.');

    InputBuilder.clear();
    InputBuilder.numberInput('Value', '25', 25);
    InputBuilder.numberInput('Index', '2', 2, 0, 20);
  },

  async runArrayInsert() {
    AnimationEngine.start();
    this.resetStats();
    const inputs = InputBuilder.container.querySelectorAll('input[type="number"]');
    const value = parseInt(inputs[0].value);
    const index = parseInt(inputs[1].value);

    if (isNaN(value) || isNaN(index) || index < 0 || index > this.state.array.length) {
      DOM.setStep('Invalid input. Index must be between 0 and array length.');
      AnimationEngine.stop();
      return;
    }

    DOM.setStep(`Shifting elements from index ${index} to make room...`);
    for (let i = this.state.array.length - 1; i >= index; i--) {
      if (!AnimationEngine.running) break;
      DOM.renderCells(this.state.array, { active: [i] });
      DOM.setStep(`Shifting element at index ${i} (${this.state.array[i]}) one position right.`);
      await AnimationEngine.wait();
    }

    this.state.array.splice(index, 0, value);
    DOM.renderCells(this.state.array, { insert: [index] });
    DOM.setStep(`Inserted ${value} at index ${index}. Array length is now ${this.state.array.length}.`);
    AnimationEngine.stop();
  },

  /* --- Array: Delete --- */
  initArrayDelete() {
    this.state.array = [10, 20, 30, 40, 50, 60];
    DOM.renderCells(this.state.array);
    DOM.setStep('Enter an index to delete, then click Run.');

    InputBuilder.clear();
    InputBuilder.numberInput('Index', '2', 2, 0, 10);
  },

  async runArrayDelete() {
    AnimationEngine.start();
    this.resetStats();
    const indexInput = InputBuilder.container.querySelector('input[type="number"]');
    const index = indexInput ? parseInt(indexInput.value) : -1;

    if (isNaN(index) || index < 0 || index >= this.state.array.length) {
      DOM.setStep('Invalid index.');
      AnimationEngine.stop();
      return;
    }

    const removed = this.state.array[index];
    DOM.renderCells(this.state.array, { del: [index] });
    DOM.setStep(`Removing element ${removed} at index ${index}...`);
    await AnimationEngine.wait();

    this.state.array.splice(index, 1);

    for (let i = index; i < this.state.array.length; i++) {
      if (!AnimationEngine.running) break;
      DOM.renderCells(this.state.array, { active: [i] });
      DOM.setStep(`Shifting element at index ${i + 1} to index ${i}.`);
      await AnimationEngine.wait();
    }

    DOM.renderCells(this.state.array);
    DOM.setStep(`Deleted ${removed}. Array length is now ${this.state.array.length}.`);
    AnimationEngine.stop();
  },

  /* --- Linear Search --- */
  initLinearSearch() {
    this.state.array = [15, 8, 42, 23, 16, 4, 31, 19, 27];
    DOM.renderBars(this.state.array);
    DOM.setStep('Enter a target value and click Run to start linear search.');

    InputBuilder.clear();
    InputBuilder.numberInput('Target', '23', 23);
  },

  async runLinearSearch() {
    AnimationEngine.start();
    this.resetStats();
    const targetInput = InputBuilder.container.querySelector('input[type="number"]');
    const target = targetInput ? parseInt(targetInput.value) : 0;
    const arr = this.state.array;
    let found = false;

    for (let i = 0; i < arr.length; i++) {
      if (!AnimationEngine.running) break;
      this.incCompare();
      DOM.renderBars(arr, { compare: [i], active: [i] });
      DOM.setStep(`Comparing index ${i}: arr[${i}] = ${arr[i]} with target ${target}.`);
      await AnimationEngine.wait();

      if (arr[i] === target) {
        DOM.renderBars(arr, { found: [i] });
        DOM.setStep(`Found ${target} at index ${i}!`);
        found = true;
        break;
      }
    }

    if (!found && AnimationEngine.running) DOM.setStep(`${target} not found in the array.`);
    AnimationEngine.stop();
  },

  /* --- Binary Search --- */
  initBinarySearch() {
    this.state.array = [2, 5, 8, 12, 16, 23, 38, 45, 56, 67, 78];
    DOM.renderBars(this.state.array);
    DOM.setStep('Binary search requires a sorted array. Enter target and click Run.');

    InputBuilder.clear();
    InputBuilder.numberInput('Target', '23', 23);
  },

  async runBinarySearch() {
    AnimationEngine.start();
    this.resetStats();
    const targetInput = InputBuilder.container.querySelector('input[type="number"]');
    const target = targetInput ? parseInt(targetInput.value) : 0;
    
    // Always operate on sorted array for binary search correctness
    const arr = [...this.state.array].sort((a, b) => a - b);
    this.state.array = arr;
    
    let low = 0, high = arr.length - 1;
    let found = false;

    while (low <= high) {
      if (!AnimationEngine.running) break;
      const mid = Math.floor((low + high) / 2);
      this.incCompare();

      const pointers = {};
      pointers[low] = 'L';
      pointers[mid] = 'M';
      pointers[high] = 'H';

      DOM.renderBars(arr, { compare: [mid], active: [low, mid, high], pointers });
      DOM.setStep(`Comparing mid index ${mid}: arr[${mid}] = ${arr[mid]}. Search range [${low}, ${high}].`);
      await AnimationEngine.wait();

      if (arr[mid] === target) {
        DOM.renderBars(arr, { found: [mid] });
        DOM.setStep(`Found ${target} at index ${mid}!`);
        found = true;
        break;
      } else if (arr[mid] < target) {
        DOM.setStep(`${arr[mid]} < ${target}. Moving low pointer to ${mid + 1}.`);
        low = mid + 1;
      } else {
        DOM.setStep(`${arr[mid]} > ${target}. Moving high pointer to ${mid - 1}.`);
        high = mid - 1;
      }
      await AnimationEngine.wait();
    }

    if (!found && AnimationEngine.running) DOM.setStep(`${target} not found in the array.`);
    AnimationEngine.stop();
  },

  /* --- Bubble Sort --- */
  initBubbleSort() {
    this.state.array = [64, 34, 25, 12, 22, 11, 90, 45];
    DOM.renderBars(this.state.array);
    DOM.setStep('Click Run to start Bubble Sort.');

    InputBuilder.clear();
    InputBuilder.textInput('Array', '', this.state.array.join(','));
    InputBuilder.button('Randomize', () => {
      this.state.array = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
      const textInput = InputBuilder.container.querySelector('input[type="text"]');
      if (textInput) textInput.value = this.state.array.join(',');
      DOM.renderBars(this.state.array);
    });
  },

  async runBubbleSort() {
    AnimationEngine.start();
    this.resetStats();
    const arr = [...this.state.array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (!AnimationEngine.running) break;
        this.incCompare();
        DOM.renderBars(arr, { compare: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) });
        DOM.setStep(`Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]}).`);
        await AnimationEngine.wait();

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          this.incSwap();
          DOM.renderBars(arr, { swap: [j, j + 1], sorted: Array.from({ length: i }, (_, k) => n - 1 - k) });
          DOM.setStep(`Swapping ${arr[j + 1]} and ${arr[j]}.`);
          await AnimationEngine.wait();
        }
      }
    }

    if (AnimationEngine.running) {
      DOM.renderBars(arr, { sorted: arr.map((_, i) => i) });
      DOM.setStep('Bubble Sort complete! Array is sorted.');
      this.state.array = arr;
    }
    AnimationEngine.stop();
  },

  /* --- Selection Sort --- */
  initSelectionSort() {
    this.state.array = [29, 10, 14, 37, 13, 8, 45, 22];
    DOM.renderBars(this.state.array);
    DOM.setStep('Click Run to start Selection Sort.');

    InputBuilder.clear();
    InputBuilder.button('Randomize', () => {
      this.state.array = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
      DOM.renderBars(this.state.array);
    });
  },

  async runSelectionSort() {
    AnimationEngine.start();
    this.resetStats();
    const arr = [...this.state.array];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      if (!AnimationEngine.running) break;
      let minIdx = i;
      DOM.renderBars(arr, { active: [i], sorted: Array.from({ length: i }, (_, k) => k) });
      DOM.setStep(`Pass ${i + 1}: Finding minimum in unsorted portion starting at index ${i}.`);
      await AnimationEngine.wait();

      for (let j = i + 1; j < n; j++) {
        if (!AnimationEngine.running) break;
        this.incCompare();
        DOM.renderBars(arr, { compare: [minIdx, j], active: [i], sorted: Array.from({ length: i }, (_, k) => k) });
        DOM.setStep(`Comparing index ${j} (${arr[j]}) with current min at index ${minIdx} (${arr[minIdx]}).`);
        await AnimationEngine.wait();
        if (arr[j] < arr[minIdx]) minIdx = j;
      }

      if (minIdx !== i && AnimationEngine.running) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        this.incSwap();
        DOM.renderBars(arr, { swap: [i, minIdx], sorted: Array.from({ length: i + 1 }, (_, k) => k) });
        DOM.setStep(`Swapping minimum ${arr[i]} to index ${i}.`);
        await AnimationEngine.wait();
      }
    }

    if (AnimationEngine.running) {
      DOM.renderBars(arr, { sorted: arr.map((_, i) => i) });
      DOM.setStep('Selection Sort complete!');
      this.state.array = arr;
    }
    AnimationEngine.stop();
  },

  /* --- Insertion Sort --- */
  initInsertionSort() {
    this.state.array = [12, 11, 13, 5, 6, 7, 19, 3];
    DOM.renderBars(this.state.array);
    DOM.setStep('Click Run to start Insertion Sort.');

    InputBuilder.clear();
    InputBuilder.button('Randomize', () => {
      this.state.array = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
      DOM.renderBars(this.state.array);
    });
  },

  async runInsertionSort() {
    AnimationEngine.start();
    this.resetStats();
    const arr = [...this.state.array];

    for (let i = 1; i < arr.length; i++) {
      if (!AnimationEngine.running) break;
      const key = arr[i];
      let j = i - 1;

      DOM.renderBars(arr, { active: [i], sorted: Array.from({ length: i }, (_, k) => k) });
      DOM.setStep(`Inserting element ${key} at index ${i} into sorted portion.`);
      await AnimationEngine.wait();

      while (j >= 0) {
        if (!AnimationEngine.running) break;
        this.incCompare();
        DOM.renderBars(arr, { compare: [j, j + 1], active: [i], sorted: Array.from({ length: i }, (_, k) => k) });
        DOM.setStep(`Comparing ${arr[j]} with ${key}.`);
        await AnimationEngine.wait();

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          this.incSwap();
          DOM.renderBars(arr, { swap: [j, j + 1] });
          DOM.setStep(`Shifting ${arr[j + 1]} to index ${j + 1}.`);
          await AnimationEngine.wait();
          j--;
        } else break;
      }

      arr[j + 1] = key;
      DOM.renderBars(arr, { sorted: Array.from({ length: i + 1 }, (_, k) => k) });
      await AnimationEngine.wait();
    }

    if (AnimationEngine.running) {
      DOM.renderBars(arr, { sorted: arr.map((_, idx) => idx) });
      DOM.setStep('Insertion Sort complete!');
      this.state.array = arr;
    }
    AnimationEngine.stop();
  },

  /* --- Merge Sort --- */
  initMergeSort() {
    this.state.array = [38, 27, 43, 3, 9, 82, 10, 19];
    DOM.renderBars(this.state.array);
    DOM.setStep('Click Run to start Merge Sort.');

    InputBuilder.clear();
    InputBuilder.button('Randomize', () => {
      this.state.array = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
      DOM.renderBars(this.state.array);
    });
  },

  async runMergeSort() {
    AnimationEngine.start();
    this.resetStats();
    const arr = [...this.state.array];

    const merge = async (left, mid, right) => {
      if (!AnimationEngine.running) return;
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;

      while (i < leftArr.length && j < rightArr.length) {
        if (!AnimationEngine.running) return;
        this.incCompare();
        DOM.renderBars(arr, { compare: [k], active: [left, right] });
        DOM.setStep(`Merging: comparing ${leftArr[i]} and ${rightArr[j]}.`);
        await AnimationEngine.wait();

        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i++];
        } else {
          arr[k] = rightArr[j++];
          this.incSwap();
        }
        DOM.renderBars(arr, { swap: [k] });
        k++;
        await AnimationEngine.wait();
      }

      while (i < leftArr.length && AnimationEngine.running) { arr[k++] = leftArr[i++]; await AnimationEngine.wait(); }
      while (j < rightArr.length && AnimationEngine.running) { arr[k++] = rightArr[j++]; await AnimationEngine.wait(); }
    };

    const sort = async (left, right) => {
      if (left >= right || !AnimationEngine.running) return;
      const mid = Math.floor((left + right) / 2);
      DOM.setStep(`Dividing range [${left}, ${right}] at mid = ${mid}.`);
      await AnimationEngine.wait();
      await sort(left, mid);
      await sort(mid + 1, right);
      await merge(left, mid, right);
    };

    await sort(0, arr.length - 1);
    if (AnimationEngine.running) {
      DOM.renderBars(arr, { sorted: arr.map((_, i) => i) });
      DOM.setStep('Merge Sort complete!');
      this.state.array = arr;
    }
    AnimationEngine.stop();
  },

  /* --- Quick Sort --- */
  initQuickSort() {
    this.state.array = [10, 80, 30, 90, 40, 50, 70, 25];
    DOM.renderBars(this.state.array);
    DOM.setStep('Click Run to start Quick Sort.');

    InputBuilder.clear();
    InputBuilder.button('Randomize', () => {
      this.state.array = Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
      DOM.renderBars(this.state.array);
    });
  },

  async runQuickSort() {
    AnimationEngine.start();
    this.resetStats();
    const arr = [...this.state.array];

    const partition = async (low, high) => {
      const pivot = arr[high];
      let i = low - 1;

      DOM.renderBars(arr, { pivot: [high] });
      DOM.setStep(`Partitioning: pivot = ${pivot} at index ${high}.`);
      await AnimationEngine.wait();

      for (let j = low; j < high; j++) {
        if (!AnimationEngine.running) return i + 1;
        this.incCompare();
        DOM.renderBars(arr, { compare: [j], pivot: [high], active: [i + 1] });
        DOM.setStep(`Comparing arr[${j}] = ${arr[j]} with pivot ${pivot}.`);
        await AnimationEngine.wait();

        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          this.incSwap();
          DOM.renderBars(arr, { swap: [i, j], pivot: [high] });
          DOM.setStep(`Swapping ${arr[i]} and ${arr[j]}.`);
          await AnimationEngine.wait();
        }
      }

      if (AnimationEngine.running) {
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        this.incSwap();
        DOM.renderBars(arr, { pivot: [i + 1], sorted: [i + 1] });
        DOM.setStep(`Placing pivot ${pivot} at index ${i + 1}.`);
        await AnimationEngine.wait();
      }
      return i + 1;
    };

    const sort = async (low, high) => {
      if (low < high && AnimationEngine.running) {
        const pi = await partition(low, high);
        await sort(low, pi - 1);
        await sort(pi + 1, high);
      }
    };

    await sort(0, arr.length - 1);
    if (AnimationEngine.running) {
      DOM.renderBars(arr, { sorted: arr.map((_, i) => i) });
      DOM.setStep('Quick Sort complete!');
      this.state.array = arr;
    }
    AnimationEngine.stop();
  },

  /* --- Stack --- */
  initStack() {
    this.state.stack = [10, 20, 30];
    DOM.renderStack(this.state.stack, this.state.stack.length - 1);
    DOM.setStep('Use Push, Pop, or Peek operations.');

    InputBuilder.clear();
    InputBuilder.numberInput('Value', '40', 40);
    InputBuilder.button('Push', () => this.stackPush(), true);
    InputBuilder.button('Pop', () => this.stackPop());
    InputBuilder.button('Peek', () => this.stackPeek());
  },

  async stackPush() {
    const valInput = InputBuilder.container.querySelector('input[type="number"]');
    const val = valInput ? parseInt(valInput.value) : NaN;
    if (isNaN(val)) return;
    AnimationEngine.start();
    this.state.stack.push(val);
    DOM.renderStack(this.state.stack, this.state.stack.length - 1);
    DOM.setStep(`Pushed ${val} onto the stack. Top is now ${val}.`);
    AnimationEngine.stop();
  },

  async stackPop() {
    if (this.state.stack.length === 0) {
      DOM.setStep('Stack is empty — cannot pop.');
      return;
    }
    AnimationEngine.start();
    const val = this.state.stack.pop();
    DOM.renderStack(this.state.stack, this.state.stack.length - 1);
    DOM.setStep(`Popped ${val} from the stack.${this.state.stack.length ? ` New top is ${this.state.stack[this.state.stack.length - 1]}.` : ' Stack is now empty.'}`);
    AnimationEngine.stop();
  },

  stackPeek() {
    if (this.state.stack.length === 0) {
      DOM.setStep('Stack is empty.');
      return;
    }
    const val = this.state.stack[this.state.stack.length - 1];
    DOM.renderStack(this.state.stack, this.state.stack.length - 1);
    DOM.setStep(`Peek: top element is ${val} (not removed).`);
  },

  /* --- Queue --- */
  initQueue() {
    this.state.queue = [5, 10, 15];
    DOM.renderQueue(this.state.queue, 0, this.state.queue.length - 1);
    DOM.setStep('Use Enqueue or Dequeue operations.');

    InputBuilder.clear();
    InputBuilder.numberInput('Value', '20', 20);
    InputBuilder.button('Enqueue', () => this.queueEnqueue(), true);
    InputBuilder.button('Dequeue', () => this.queueDequeue());
  },

  queueEnqueue() {
    const valInput = InputBuilder.container.querySelector('input[type="number"]');
    const val = valInput ? parseInt(valInput.value) : NaN;
    if (isNaN(val)) return;
    this.state.queue.push(val);
    DOM.renderQueue(this.state.queue, 0, this.state.queue.length - 1);
    DOM.setStep(`Enqueued ${val} at the rear.`);
  },

  queueDequeue() {
    if (this.state.queue.length === 0) {
      DOM.setStep('Queue is empty — cannot dequeue.');
      return;
    }
    const val = this.state.queue.shift();
    DOM.renderQueue(this.state.queue, 0, this.state.queue.length - 1);
    DOM.setStep(`Dequeued ${val} from the front.${this.state.queue.length ? ` Front is now ${this.state.queue[0]}.` : ' Queue is now empty.'}`);
  },

  /* --- Singly Linked List --- */
  initLinkedList() {
    this.state.list = [10, 20, 30, 40];
    DOM.renderLinkedList(this.state.list);
    DOM.setStep('Interactive Singly Linked List — Insert, Delete, or Traverse nodes.');

    InputBuilder.clear();
    InputBuilder.numberInput('Value', '25', 25);
    InputBuilder.numberInput('Index', '0', 0, 0, 20);
    InputBuilder.button('Insert Head', () => this.llInsertHead(), true);
    InputBuilder.button('Insert Tail', () => this.llInsertTail());
    InputBuilder.button('Insert at Index', () => this.llInsertIndex());
    InputBuilder.button('Delete Index', () => this.llDeleteIndex());
    InputBuilder.button('Traverse', () => this.llTraverse());
  },

  async llInsertHead() {
    AnimationEngine.start();
    const inputs = InputBuilder.container.querySelectorAll('input[type="number"]');
    const val = parseInt(inputs[0].value);

    if (isNaN(val)) {
      DOM.setStep('Invalid value.');
      AnimationEngine.stop();
      return;
    }

    this.state.list.unshift(val);
    DOM.renderLinkedList(this.state.list, { insert: [0] });
    DOM.setStep(`Inserted node ${val} at HEAD.`);
    await AnimationEngine.wait();
    DOM.renderLinkedList(this.state.list);
    AnimationEngine.stop();
  },

  async llInsertTail() {
    AnimationEngine.start();
    const inputs = InputBuilder.container.querySelectorAll('input[type="number"]');
    const val = parseInt(inputs[0].value);

    if (isNaN(val)) {
      DOM.setStep('Invalid value.');
      AnimationEngine.stop();
      return;
    }

    this.state.list.push(val);
    DOM.renderLinkedList(this.state.list, { insert: [this.state.list.length - 1] });
    DOM.setStep(`Inserted node ${val} at TAIL.`);
    await AnimationEngine.wait();
    DOM.renderLinkedList(this.state.list);
    AnimationEngine.stop();
  },

  async llInsertIndex() {
    AnimationEngine.start();
    const inputs = InputBuilder.container.querySelectorAll('input[type="number"]');
    const val = parseInt(inputs[0].value);
    const index = parseInt(inputs[1].value);

    if (isNaN(val) || isNaN(index) || index < 0 || index > this.state.list.length) {
      DOM.setStep('Invalid value or index.');
      AnimationEngine.stop();
      return;
    }

    DOM.setStep(`Traversing list to index ${index}...`);
    for (let i = 0; i < index; i++) {
      if (!AnimationEngine.running) break;
      DOM.renderLinkedList(this.state.list, { active: [i] });
      DOM.setStep(`Visiting node ${i} (val = ${this.state.list[i]})...`);
      await AnimationEngine.wait();
    }

    if (AnimationEngine.running) {
      this.state.list.splice(index, 0, val);
      DOM.renderLinkedList(this.state.list, { insert: [index] });
      DOM.setStep(`Inserted node ${val} at index ${index}.`);
      await AnimationEngine.wait();
      DOM.renderLinkedList(this.state.list);
    }
    AnimationEngine.stop();
  },

  async llDeleteIndex() {
    AnimationEngine.start();
    const inputs = InputBuilder.container.querySelectorAll('input[type="number"]');
    const index = parseInt(inputs[1].value);

    if (isNaN(index) || index < 0 || index >= this.state.list.length) {
      DOM.setStep('Invalid index.');
      AnimationEngine.stop();
      return;
    }

    for (let i = 0; i <= index; i++) {
      if (!AnimationEngine.running) break;
      DOM.renderLinkedList(this.state.list, { active: [i] });
      DOM.setStep(`Traversing to target node at index ${i}...`);
      await AnimationEngine.wait();
    }

    if (AnimationEngine.running) {
      DOM.renderLinkedList(this.state.list, { del: [index] });
      DOM.setStep(`Removing node at index ${index}...`);
      await AnimationEngine.wait();

      const removed = this.state.list.splice(index, 1)[0];
      DOM.renderLinkedList(this.state.list);
      DOM.setStep(`Deleted node with value ${removed} at index ${index}.`);
    }
    AnimationEngine.stop();
  },

  async llTraverse() {
    AnimationEngine.start();
    this.resetStats();
    for (let i = 0; i < this.state.list.length; i++) {
      if (!AnimationEngine.running) break;
      DOM.renderLinkedList(this.state.list, { active: [i] });
      DOM.setStep(`Traversing node ${i}: value = ${this.state.list[i]}.`);
      await AnimationEngine.wait();
    }
    if (AnimationEngine.running) DOM.setStep('Linked List traversal complete.');
    AnimationEngine.stop();
  }
};

/* ============================================
   MODULE: Handlers Registry
   ============================================ */
const ALGO_HANDLERS = {
  'array-create': { init: 'initArrayCreate', run: 'runArrayCreate' },
  'array-insert': { init: 'initArrayInsert', run: 'runArrayInsert' },
  'array-delete': { init: 'initArrayDelete', run: 'runArrayDelete' },
  'linear-search': { init: 'initLinearSearch', run: 'runLinearSearch' },
  'binary-search': { init: 'initBinarySearch', run: 'runBinarySearch' },
  'bubble-sort': { init: 'initBubbleSort', run: 'runBubbleSort' },
  'selection-sort': { init: 'initSelectionSort', run: 'runSelectionSort' },
  'insertion-sort': { init: 'initInsertionSort', run: 'runInsertionSort' },
  'merge-sort': { init: 'initMergeSort', run: 'runMergeSort' },
  'quick-sort': { init: 'initQuickSort', run: 'runQuickSort' },
  stack: { init: 'initStack', run: null },
  queue: { init: 'initQueue', run: null },
  'linked-list': { init: 'initLinkedList', run: 'llTraverse' }
};

/* ============================================
   MODULE: App Controller
   ============================================ */
const App = {
  currentAlgo: null,

  init() {
    InputBuilder.init();
    this.bindEvents();
    this.hideLoader();
  },

  hideLoader() {
    setTimeout(() => {
      const loader = DOM.$('loader');
      if (loader) loader.classList.add('hidden');
    }, 800);
  },

  bindEvents() {
    // Sidebar navigation algorithm links
    document.querySelectorAll('.nav-link[data-algo]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectAlgorithm(link.dataset.algo);
        this.closeSidebar();
      });
    });

    // Section navigation (Overview / About)
    document.querySelectorAll('.nav-link[data-section], .footer-links a[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.showSection(link.dataset.section);
        this.closeSidebar();
      });
    });

    // Hero Start Exploring button
    const exploreBtn = DOM.$('start-exploring');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        this.selectAlgorithm('bubble-sort');
      });
    }

    // Animation controls
    DOM.$('btn-play').addEventListener('click', () => this.run());
    DOM.$('btn-pause').addEventListener('click', () => this.togglePause());
    DOM.$('btn-reset').addEventListener('click', () => this.reset());

    // Speed slider
    const slider = DOM.$('speed-slider');
    if (slider) {
      slider.addEventListener('input', () => {
        AnimationEngine.speed = parseInt(slider.value);
        DOM.$('speed-value').textContent = `${slider.value}x`;
      });
    }

    // Mobile sidebar toggle
    const toggle = DOM.$('sidebar-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        DOM.$('sidebar').classList.toggle('open');
        toggle.classList.toggle('active');
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (AnimationEngine.running) this.togglePause();
        else this.run();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        this.reset();
      }
    });
  },

  showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    if (section === 'home') {
      DOM.$('home').classList.add('active');
      const homeLink = document.querySelector('[data-section="home"]');
      if (homeLink) homeLink.classList.add('active');
    } else if (section === 'about') {
      DOM.$('about').classList.add('active');
      const aboutLink = document.querySelector('[data-section="about"]');
      if (aboutLink) aboutLink.classList.add('active');
    }
  },

  selectAlgorithm(algoId) {
    this.currentAlgo = algoId;
    const meta = ALGO_META[algoId];
    if (!meta) return;

    // Update UI
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    DOM.$('visualizer').classList.add('active');

    const navItem = document.querySelector(`[data-algo="${algoId}"]`);
    if (navItem) navItem.classList.add('active');

    DOM.$('algo-title').textContent = meta.title;
    DOM.$('algo-description').textContent = meta.description;
    DOM.$('time-complexity').textContent = meta.time;
    DOM.$('space-complexity').textContent = meta.space;
    DOM.$('breadcrumb-algo').textContent = meta.title;

    // Reset animation engine and controls
    AnimationEngine.stop();
    DOM.$('btn-play').disabled = false;
    DOM.$('btn-pause').disabled = true;
    DOM.$('btn-pause').innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> <span>Pause</span>';

    // Initialize algorithm
    const handler = ALGO_HANDLERS[algoId];
    if (handler && Algorithms[handler.init]) {
      Algorithms[handler.init]();
    }

    Algorithms.resetStats();
  },

  async run() {
    if (AnimationEngine.running) return;

    const handler = ALGO_HANDLERS[this.currentAlgo];
    if (!handler || !handler.run) {
      if (this.currentAlgo === 'stack') await Algorithms.stackPush();
      else if (this.currentAlgo === 'queue') Algorithms.queueEnqueue();
      return;
    }

    DOM.$('btn-play').disabled = true;
    DOM.$('btn-pause').disabled = false;

    await Algorithms[handler.run]();

    DOM.$('btn-play').disabled = false;
    DOM.$('btn-pause').disabled = true;
    DOM.$('btn-pause').innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> <span>Pause</span>';
  },

  togglePause() {
    if (AnimationEngine.paused) {
      AnimationEngine.resume();
      DOM.$('btn-pause').innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> <span>Pause</span>';
    } else {
      AnimationEngine.pause();
      DOM.$('btn-pause').innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> <span>Resume</span>';
    }
  },

  reset() {
    AnimationEngine.stop();
    DOM.$('btn-play').disabled = false;
    DOM.$('btn-pause').disabled = true;
    DOM.$('btn-pause').innerHTML = '<svg class="btn-svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> <span>Pause</span>';

    if (this.currentAlgo) {
      const handler = ALGO_HANDLERS[this.currentAlgo];
      if (handler && Algorithms[handler.init]) {
        Algorithms[handler.init]();
      }
    }
    Algorithms.resetStats();
  },

  closeSidebar() {
    const sidebar = DOM.$('sidebar');
    const toggle = DOM.$('sidebar-toggle');
    if (sidebar) sidebar.classList.remove('open');
    if (toggle) toggle.classList.remove('active');
  }
};

/* Boot Application */
document.addEventListener('DOMContentLoaded', () => App.init());
