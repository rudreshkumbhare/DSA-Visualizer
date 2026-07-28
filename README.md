# ⚡ DSA Visualizer — Interactive Data Structures & Algorithms Visualizer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS-Modern_Dark_Mode-blueviolet.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero-brightgreen.svg)](#features)

> An open-source, developer-quality interactive visualizer built with vanilla HTML5, CSS3, and modern JavaScript. Designed for computer science students, interview preparation, and visual learners.

---

## 📸 Demo & Screenshots

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DSA VISUALIZER WORKSPACE                           │
├───────────────────┬─────────────────────────────────────────────────────────┤
│ COMPLEXITY        │ LIVE CANVAS PREVIEW                            [ Ready ]│
│ Time:  O(n log n) │                                                         │
│ Space: O(log n)   │   █      █                                              │
│                   │   █  █   █  █   █  █                                    │
│ STATS             │   █  █   █  █   █  █   █                                │
│ Compares: 14      │  [0] [1] [2] [3] [4] [5] [6]                            │
│ Swaps:    8       │                                                         │
├───────────────────┴─────────────────────────────────────────────────────────┤
│ [ ▶ Run ]  [ ⏸ Pause ]  [ 🔄 Reset ]                Speed: ─────●── 5x     │
└─────────────────────────────────────────────────────────────────────────────┘
```

> *(Replace placeholders below with your actual project screenshots after hosting or capturing images)*

| Overview Landing | Algorithm Workspace |
| :---: | :---: |
| ![Landing Page Placeholder](https://via.placeholder.com/600x350/0d1424/38bdf8?text=DSA+Visualizer+Overview+Landing) | ![Workspace Placeholder](https://via.placeholder.com/600x350/0d1424/38bdf8?text=Interactive+Sorting+%26+DS+Canvas) |

| Linked List Pointer Visualizer | Sorting Comparisons |
| :---: | :---: |
| ![Linked List Placeholder](https://via.placeholder.com/600x350/0d1424/c084fc?text=HEAD+->+[10|+next]+->+NULL) | ![Sorting Placeholder](https://via.placeholder.com/600x350/0d1424/34d399?text=Live+Bar+Comparisons+%26+Swaps) |

---

## ✨ Features

- **⚡ Zero External Dependencies**: Built entirely with native Vanilla JS, standard DOM APIs, and CSS3 without build tools or node modules.
- **🎨 Developer-Quality Aesthetic**: Vercel & Linear inspired sleek dark mode (`#090d16`), glassmorphism cards (`backdrop-filter`), glowing accent states, and responsive layout.
- **🔗 Dual-Box Singly Linked List**: Realistic node representation showing `[ Data | Next • ]` pointers, dynamic `HEAD` badge, arrow connections, and `NULL` termination.
- **📊 Real-time Execution Metrics**: Live comparison counters, swap tracking, step explanations, and color-coded status legends.
- **🎛️ Animation Control Toolbar**: Adjust speed on the fly (1x to 10x), run, pause, resume, or reset animations instantly.
- **⌨️ Keyboard Shortcuts**:
  - `Space` — Toggle Run / Pause
  - `R` — Reset Current Visualization

---

## 📊 Supported Algorithms & Complexity Matrix

| Algorithm / Data Structure | Category | Time (Best) | Time (Average) | Time (Worst) | Space |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Create Array** | Array | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ |
| **Insert Element** | Array | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | $\mathcal{O}(1)$ |
| **Delete Element** | Array | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | $\mathcal{O}(1)$ |
| **Linear Search** | Search | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | $\mathcal{O}(1)$ |
| **Binary Search** | Search | $\mathcal{O}(1)$ | $\mathcal{O}(\log n)$ | $\mathcal{O}(\log n)$ | $\mathcal{O}(1)$ |
| **Bubble Sort** | Sort | $\mathcal{O}(n)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ |
| **Selection Sort** | Sort | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ |
| **Insertion Sort** | Sort | $\mathcal{O}(n)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ |
| **Merge Sort** | Sort | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n)$ |
| **Quick Sort** | Sort | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n^2)$ | $\mathcal{O}(\log n)$ |
| **Stack (LIFO)** | Data Structure | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ |
| **Queue (FIFO)** | Data Structure | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ |
| **Linked List** | Data Structure | $\mathcal{O}(1)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ |

---

## 📁 Project Structure

```
DSA-Visualizer/
├── index.html       # Main HTML markup, semantic layout & Lucide SVG icons
├── style.css        # Vercel/Linear dark theme, glassmorphism & responsive CSS
├── script.js       # Asynchronous animation engine, state manager & algos
└── README.md        # Documentation, complexity table & setup guide
```

---

## 🚀 Installation & Local Setup

Since **DSA Visualizer** has zero build dependencies, you can launch it instantly:

### Method 1: Direct File Open
1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-username/DSA-Visualizer.git
   cd DSA-Visualizer
   ```
2. Double-click `index.html` to open it in your browser (Chrome, Firefox, Safari, Edge).

### Method 2: Local HTTP Server (Optional)
If using VS Code or Node.js:
- **VS Code**: Install the **Live Server** extension, right-click `index.html` -> **Open with Live Server**.
- **Node.js**:
  ```bash
  npx serve .
  ```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add new algorithms or improve animations:
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.
