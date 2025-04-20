# Minesweeper

A modern, customizable implementation of the classic Minesweeper game built with React and TypeScript. This project uses Chakra UI for the interface and is configured for easy GitHub Pages deployment.

![Minesweeper Game Screenshot](https://via.placeholder.com/800x450.png?text=Minesweeper+Game)

## Features

- 🎮 Classic Minesweeper gameplay (left-click to reveal, right-click to flag)
- 🏆 Multiple difficulty levels (Beginner, Intermediate, Expert)
- ⚙️ Custom game settings (rows, columns, mines)
- 🎨 Light and dark theme support
- 📊 High scores saved locally
- 📱 Responsive design for desktop and mobile
- ⏱️ Game timer with pause/resume
- 🔄 Animation options

## Technologies Used

- **React** - UI library
- **TypeScript** - Type safety
- **Chakra UI** - Component library
- **Vite** - Build tool
- **LocalStorage** - Saving scores and settings

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/minesweeper.git
cd minesweeper
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and visit `http://localhost:5173/` to play the game.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `dist` folder with optimized production build.

## Deploying to GitHub Pages

This project is configured for easy deployment to GitHub Pages. Follow these steps:

1. Update the `vite.config.ts` file to use your repository name:

```typescript
const getBase = () => {
  if (process.env.NODE_ENV === 'development') {
    return '/';
  }
  return '/your-repo-name/'; // Replace with your repository name
};
```

2. Run the deploy command:

```bash
npm run deploy
# or
yarn deploy
```

This will build your project and publish it to the `gh-pages` branch of your repository.

3. Enable GitHub Pages in your repository settings, using the `gh-pages` branch as the source.

After a few minutes, your game will be available at `https://yourusername.github.io/your-repo-name/`.

## Game Rules

- Left-click to reveal a cell
- Right-click to place or remove a flag
- The number on a revealed cell indicates how many mines are in the adjacent cells
- The game is won when all non-mine cells are revealed
- The game is lost if a mine is revealed

## Customization

You can customize various aspects of the game:

- **Difficulty Levels**: Choose from Beginner (9x9 with 10 mines), Intermediate (16x16 with 40 mines), or Expert (16x30 with 99 mines)
- **Custom Game**: Set your own board dimensions and mine count
- **UI Settings**: Toggle animations, choose light or dark theme
- **Display Options**: Show/hide timer

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the classic Minesweeper game
- Built with React, TypeScript, and Chakra UI
- Created as a modern web implementation of a timeless game 