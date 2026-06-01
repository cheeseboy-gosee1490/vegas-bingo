* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #080010;
  color: white;
}

.app {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #ff4fc3;
  text-shadow:
    0 0 10px #ff4fc3,
    0 0 20px #ff4fc3,
    0 0 40px #ff4fc3;
  margin-bottom: 10px;
}

h2 {
  text-align: center;
}

.playerTag {
  text-align: center;
  font-size: 20px;
  margin-bottom: 20px;
}

.playerBtn {
  width: 100%;
  max-width: 700px;
  display: block;
  margin: 12px auto;
  padding: 18px;
  border-radius: 14px;
  border: 2px solid #ff4fc3;
  background: transparent;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: 0.2s;
}

.playerBtn:hover {
  background: #ff4fc3;
}

.progress {
  height: 18px;
  background: #222;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progressFill {
  height: 100%;
  background: linear-gradient(
    90deg,
    #ff4fc3,
    #ff9d00
  );
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-top: 20px;
}

.square {
  min-height: 110px;
  border-radius: 16px;
  border: 2px solid #333;
  background: #111;
  color: white;
  padding: 10px;
  cursor: pointer;
  font-size: 15px;
  line-height: 1.3;
  transition: 0.2s;
}

.square:hover {
  border-color: #ff4fc3;
  transform: scale(1.03);
}

.found {
  background: linear-gradient(
    135deg,
    #ff4fc3,
    #ff9d00
  );

  border-color: white;

  color: white;

  box-shadow:
    0 0 15px #ff4fc3,
    0 0 30px #ff9d00;
}

.topButtons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.topButtons button,
.bottomNav button {
  background: #111;
  color: white;
  border: 2px solid #ff4fc3;
  border-radius: 12px;
  padding: 12px 18px;
  cursor: pointer;
  transition: 0.2s;
}

.topButtons button:hover,
.bottomNav button:hover {
  background: #ff4fc3;
}

.bottomNav {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

.leaderboard {
  max-width: 700px;
  margin: 30px auto;
}

.leaderboard h2 {
  margin-bottom: 20px;
}

.leaderRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #111;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 10px;
}

.leaderRow strong {
  color: #ff9d00;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 600px) {
  .app {
    padding: 12px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .square {
    min-height: 90px;
    font-size: 13px;
  }

  .topButtons {
    flex-direction: column;
  }

  .bottomNav {
    flex-direction: column;
  }

  h1 {
    font-size: 32px;
  }
}
