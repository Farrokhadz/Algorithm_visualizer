<div align="center">

# 🧪 Algorithm Visualizer

**Minimal, interactive sorting & selection algorithm visualizer.**

![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📖 About

**Algorithm Visualizer** is a lightweight web app for visualizing sorting and selection algorithms. Pick an algorithm, enter your own data (or generate random data), and watch it work step by step.

---

## 📚 Algorithms

### 🔹 Insertion Sort

**Description:**
Insertion Sort builds the sorted array one element at a time. It takes each element and inserts it into its correct position among the elements that are already sorted, shifting larger elements one step to the right.

**How it works:**
1. Start from the second element (the first element is considered sorted).
2. Compare the current element with the elements before it.
3. Shift all larger elements one position to the right.
4. Insert the current element into its correct position.
5. Repeat until the whole array is sorted.

**Complexity:**

| Case | Time Complexity |
|---|---|
| Best (already sorted) | O(n) |
| Average | O(n²) |
| Worst (reverse sorted) | O(n²) |
| Space | O(1) |

**Properties:**
- ✅ Stable
- ✅ In-place
- ✅ Adaptive (fast on nearly sorted data)
- ✅ Efficient for small datasets

---

### 🔹 Merge Sort

**Description:**
Merge Sort is a divide-and-conquer algorithm. It splits the array into two halves, sorts each half recursively, and then merges the two sorted halves into one sorted array.

**How it works:**
1. Divide the array into two halves.
2. Recursively sort each half (a single element is already sorted).
3. Merge the two sorted halves by repeatedly taking the smaller front element.
4. Repeat until the whole array is merged.

**Complexity:**

| Case | Time Complexity |
|---|---|
| Best | O(n log n) |
| Average | O(n log n) |
| Worst | O(n log n) |
| Space | O(n) |

**Properties:**
- ✅ Stable
- ❌ Not in-place (needs O(n) extra memory)
- ✅ Predictable performance
- ✅ Divide and conquer

---

### 🔹 Quick Sort

**Description:**
Quick Sort is a divide-and-conquer algorithm. It picks a pivot, partitions the array so that smaller elements end up before the pivot and larger elements after it, and then sorts both sides recursively. The pivot is already in its final position after partitioning.

**How it works:**
1. Choose a pivot (here: the last element of the range).
2. Partition: move elements up to the pivot to the front, larger ones behind them.
3. Place the pivot between the two groups.
4. Recursively sort the left and right parts.

**Complexity:**

| Case | Time Complexity |
|---|---|
| Best | O(n log n) |
| Average | O(n log n) |
| Worst (e.g. sorted input with last-element pivot) | O(n²) |
| Space | O(log n) expected (recursion stack) |

**Properties:**
- ❌ Not stable
- ✅ In-place
- ✅ Fast in practice (small constants)
- ✅ Divide and conquer

---

<!-- More algorithms will be added here -->
