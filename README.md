# Dynamic Memory Simulation - Operating System Concepts

A comprehensive, interactive web-based simulator for visualizing and understanding core Operating System memory management concepts.

## 🎯 System Overview

This simulator implements and visualizes fundamental OS memory management techniques, providing an interactive learning platform for understanding how operating systems manage memory resources.

### Core Concepts Implemented

#### 1. **Variable Partitioning (Dynamic Memory Allocation)**
The simulator implements variable-size memory partitioning with multiple allocation strategies:

- **First Fit**: Allocates the first available hole large enough to fit the process
- **Best Fit**: Searches for the smallest hole that can accommodate the process, minimizing wasted space
- **Worst Fit**: Allocates the largest available hole, potentially leaving larger remaining fragments
- **Next Fit**: Similar to First Fit but continues searching from the last allocation point

**Key Features:**
- Real-time visualization of memory blocks and holes
- Dynamic process allocation and deallocation
- Memory compaction to eliminate external fragmentation
- Algorithm comparison tool to evaluate efficiency

#### 2. **Memory Fragmentation Analysis**
The system tracks and visualizes two critical types of fragmentation:

- **External Fragmentation**: Free memory scattered in non-contiguous holes, tracked over time
- **Internal Fragmentation**: Wasted space within allocated blocks (conceptual)

**Visualization:**
- Live fragmentation chart showing external fragmentation trends over allocation/deallocation operations
- Real-time statistics including total fragmentation, largest hole size, and memory utilization

#### 3. **Paging Memory Management**
Complete implementation of paging with virtual-to-physical address translation:

**Components:**
- **Page Tables**: Maps virtual pages to physical frames
- **Translation Lookaside Buffer (TLB)**: Hardware cache for fast address translation
- **Page Replacement Algorithms**:
  - FIFO (First-In-First-Out)
  - LRU (Least Recently Used)
  - Optimal (theoretical best-case)
  - Clock/Second Chance

**Features:**
- Step-by-step address translation visualization
- Page fault handling and tracking
- TLB hit/miss ratio analysis
- Working set and thrashing detection
- Physical memory frame allocation viewer

#### 4. **Memory Statistics & Metrics**
Comprehensive real-time tracking of memory system performance:

- **Allocation Metrics**: Process count, memory utilization, free space percentage
- **Fragmentation Metrics**: External fragmentation size and percentage, hole distribution
- **Paging Metrics**: Page fault rate, TLB hit ratio, effective access time
- **Performance Analysis**: Algorithm efficiency comparison, working set size

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16 (React) with TypeScript
- **Styling**: Tailwind CSS v4 with custom cyberpunk theme
- **State Management**: Zustand for reactive state
- **Animations**: Framer Motion for smooth transitions
- **Visualizations**: Custom SVG-based charts and diagrams

### Project Structure
```
memory-sim/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── allocation/    # Variable partitioning simulator
│   │   │   └── paging/        # Paging & virtual memory simulator
│   ├── components/
│   │   ├── controls/          # User input controls
│   │   ├── visual/            # Visualization components
│   │   └── ui/                # Reusable UI elements
│   └── store/
│       ├── allocationStore.ts # Allocation state & algorithms
│       └── pagingStore.ts     # Paging state & algorithms
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd memory-sim

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the simulator.

## 📚 Educational Value

This simulator is designed for:
- **Students**: Learning OS memory management concepts through interactive visualization
- **Educators**: Teaching memory allocation, paging, and fragmentation with real-time examples
- **Developers**: Understanding low-level memory management for system programming

### Learning Outcomes
- Understand different memory allocation strategies and their trade-offs
- Visualize how fragmentation occurs and impacts system performance
- Comprehend virtual memory, paging, and address translation
- Analyze page replacement algorithms and their efficiency
- Recognize thrashing conditions and working set principles

## 🎨 Design Philosophy

The interface features a **cyberpunk-inspired futuristic UI** with:
- Terminal-style windows for authentic system monitoring feel
- Real-time animated visualizations
- Color-coded memory blocks for easy identification
- Responsive design with smooth transitions
- Dark theme optimized for extended use

## 🔧 Key Algorithms Implemented

### Allocation Algorithms
```typescript
// First Fit - O(n) time complexity
// Best Fit - O(n) time complexity  
// Worst Fit - O(n) time complexity
// Next Fit - O(n) amortized time complexity
```

### Page Replacement Algorithms
```typescript
// FIFO - O(1) replacement decision
// LRU - O(1) with proper data structures
// Optimal - O(n) theoretical algorithm
// Clock - O(n) worst case, typically O(1)
```

## 📊 Performance Metrics

The simulator tracks:
- **Memory Utilization**: Percentage of allocated vs. free memory
- **Fragmentation Ratio**: External fragmentation as percentage of free space
- **Page Fault Rate**: Faults per memory access
- **TLB Hit Ratio**: TLB hits / total accesses
- **Effective Access Time**: Considering TLB, page table, and memory access times

## 🤝 Contributing

Contributions are welcome! Areas for enhancement:
- Additional page replacement algorithms (LFU, MFU, etc.)
- Segmentation with paging
- Multi-level page tables
- Memory-mapped files simulation
- Performance benchmarking tools

## 📄 License

This project is created for educational purposes.

## 🙏 Acknowledgments

Built with modern web technologies to make OS concepts accessible and engaging for learners worldwide.

---

**Note**: This simulator is designed for educational purposes and simplifies certain aspects of real operating system memory management for clarity and visualization.
